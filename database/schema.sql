-- HabitFlow Database Schema
-- Supabase PostgreSQL Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    telegram_auth_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Game progression
    level INTEGER DEFAULT 1,
    total_coins INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    experience_points INTEGER DEFAULT 0,

    -- Preferences
    theme_preference TEXT DEFAULT 'light',
    notification_enabled BOOLEAN DEFAULT true,
    timezone TEXT DEFAULT 'UTC'
);

-- Tasks table
CREATE TABLE tasks (
    task_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,

    -- Task details
    title TEXT NOT NULL CHECK (length(title) >= 2 AND length(title) <= 100),
    description TEXT CHECK (length(description) <= 500),
    category TEXT NOT NULL CHECK (category IN ('sport', 'health', 'work', 'learning', 'rest', 'personal')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),

    -- Recurrence
    recurrence_type TEXT DEFAULT 'none' CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'custom')),
    recurrence_config JSONB, -- {"days": ["mon", "tue"], "interval": 2}
    reminder_time TIME,
    due_time TIME,

    -- Status & timing
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_completed_at TIMESTAMP WITH TIME ZONE,

    -- Calculated fields (using Supabase generated columns)
    coin_value INTEGER GENERATED ALWAYS AS (
        CASE priority
            WHEN 'low' THEN 5
            WHEN 'medium' THEN 10
            WHEN 'high' THEN 15
        END *
        CASE category
            WHEN 'sport' THEN 1.2
            WHEN 'learning' THEN 1.5
            WHEN 'health' THEN 1.3
            ELSE 1.0
        END
    ) STORED
);

-- Completed tasks table
CREATE TABLE completed_tasks (
    completion_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(task_id) ON DELETE CASCADE,
    completion_date DATE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    coins_earned INTEGER NOT NULL,
    streak_bonus INTEGER DEFAULT 0,
    completion_bonus INTEGER DEFAULT 0,
    notes TEXT,

    -- Prevent duplicate completions for same task on same day
    UNIQUE(task_id, completion_date)
);

-- Achievements table
CREATE TABLE achievements (
    achievement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL, -- 'first_task', 'week_warrior', 'month_master', etc.
    progress_value INTEGER NOT NULL DEFAULT 0,
    target_value INTEGER NOT NULL,
    is_unlocked BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    notification_sent BOOLEAN DEFAULT false,

    UNIQUE(user_id, achievement_type)
);

-- User rewards table
CREATE TABLE user_rewards (
    reward_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    reward_type TEXT NOT NULL, -- 'theme', 'sticker_pack', 'profile_border', 'power_up'
    reward_item_id TEXT NOT NULL, -- 'dark_mode', 'habitflow_stickers', 'gold_border'
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT false, -- For themes, power-ups
    expires_at TIMESTAMP WITH TIME ZONE, -- For power-ups
    coins_spent INTEGER NOT NULL
);

-- Notifications table
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('reminder', 'congratulations', 'achievement', 'streak')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    metadata JSONB -- Additional context like task_id, achievement_type
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users RLS policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true);

-- Tasks RLS policies
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own tasks" ON tasks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (user_id = auth.uid());

-- Completed tasks RLS policies
CREATE POLICY "Users can view own completed tasks" ON completed_tasks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own completed tasks" ON completed_tasks FOR INSERT WITH CHECK (user_id = auth.uid());

-- Achievements RLS policies
CREATE POLICY "Users can view own achievements" ON achievements FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own achievements" ON achievements FOR UPDATE USING (user_id = auth.uid());

-- User rewards RLS policies
CREATE POLICY "Users can view own rewards" ON user_rewards FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own rewards" ON user_rewards FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications RLS policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own notifications" ON notifications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Helper functions

-- Function to update user streaks
CREATE OR REPLACE FUNCTION update_user_streak(
    p_user_id UUID,
    p_completion_date DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    last_completion_date DATE;
    new_streak INTEGER;
BEGIN
    -- Get last completion date
    SELECT MAX(completion_date) INTO last_completion_date
    FROM completed_tasks
    WHERE user_id = p_user_id AND completion_date < p_completion_date;

    -- Calculate new streak
    IF last_completion_date IS NULL THEN
        new_streak := 1;
    ELSEIF last_completion_date = p_completion_date - INTERVAL '1 day' THEN
        -- Continue streak
        SELECT current_streak + 1 INTO new_streak
        FROM users
        WHERE user_id = p_user_id;
    ELSEIF last_completion_date < p_completion_date - INTERVAL '1 day' THEN
        -- Reset streak
        new_streak := 1;
    ELSE
        -- Same day completion, no change
        RETURN true;
    END IF;

    -- Update user streak
    UPDATE users SET
        current_streak = new_streak,
        longest_streak = GREATEST(longest_streak, new_streak),
        updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN true;
END;
$$;

-- Function to check and unlock achievements
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    -- First task achievement
    INSERT INTO achievements (user_id, achievement_type, progress_value, target_value, is_unlocked, unlocked_at)
    VALUES (p_user_id, 'first_task', 1, 1, true, NOW())
    ON CONFLICT (user_id, achievement_type) DO NOTHING
    WHERE NOT EXISTS (
        SELECT 1 FROM achievements
        WHERE user_id = p_user_id AND achievement_type = 'first_task' AND is_unlocked = true
    );

    -- Week warrior (7-day streak)
    UPDATE achievements
    SET progress_value = GREATEST(progress_value, u.current_streak),
        is_unlocked = CASE WHEN u.current_streak >= 7 THEN true ELSE is_unlocked END,
        unlocked_at = CASE WHEN u.current_streak >= 7 AND is_unlocked = false THEN NOW() ELSE unlocked_at END
    FROM users u
    WHERE achievements.user_id = p_user_id
        AND achievements.user_id = u.user_id
        AND achievements.achievement_type = 'week_warrior';

    -- Month master (30-day streak)
    UPDATE achievements
    SET progress_value = GREATEST(progress_value, u.current_streak),
        is_unlocked = CASE WHEN u.current_streak >= 30 THEN true ELSE is_unlocked END,
        unlocked_at = CASE WHEN u.current_streak >= 30 AND is_unlocked = false THEN NOW() ELSE unlocked_at END
    FROM users u
    WHERE achievements.user_id = p_user_id
        AND achievements.user_id = u.user_id
        AND achievements.achievement_type = 'month_master';

    -- Task champion (100 completed tasks)
    UPDATE achievements
    SET progress_value = ct.task_count,
        is_unlocked = CASE WHEN ct.task_count >= 100 THEN true ELSE is_unlocked END,
        unlocked_at = CASE WHEN ct.task_count >= 100 AND is_unlocked = false THEN NOW() ELSE unlocked_at END
    FROM (
        SELECT COUNT(*) as task_count
        FROM completed_tasks
        WHERE user_id = p_user_id
    ) ct
    WHERE achievements.user_id = p_user_id
        AND achievements.achievement_type = 'task_champion';
END;
$$;

-- Triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update streaks and check achievements after task completion
CREATE OR REPLACE FUNCTION after_task_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user streak
    PERFORM update_user_streak(NEW.user_id, NEW.completion_date);

    -- Check achievements
    PERFORM check_achievements(NEW.user_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_completion_trigger
    AFTER INSERT ON completed_tasks
    FOR EACH ROW
    EXECUTE FUNCTION after_task_completion();

-- Initial achievements for new users
CREATE OR REPLACE FUNCTION create_initial_achievements(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO achievements (user_id, achievement_type, target_value, is_unlocked)
    VALUES
        (p_user_id, 'first_task', 1, false),
        (p_user_id, 'week_warrior', 7, false),
        (p_user_id, 'month_master', 30, false),
        (p_user_id, 'task_champion', 100, false),
        (p_user_id, 'perfect_week', 7, false);
END;
$$;

-- Trigger to create initial achievements for new users
CREATE OR REPLACE FUNCTION after_user_creation()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM create_initial_achievements(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_creation_trigger
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION after_user_creation();