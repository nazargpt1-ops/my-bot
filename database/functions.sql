-- HabitFlow Supabase Functions

-- Function to authenticate or create Telegram user
CREATE OR REPLACE FUNCTION authenticate_telegram_user(
  p_telegram_id BIGINT,
  p_username TEXT DEFAULT NULL,
  p_full_name TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL,
  p_auth_data JSONB DEFAULT NULL
)
RETURNS TABLE (user_id UUID, telegram_id BIGINT, username TEXT, full_name TEXT, avatar_url TEXT,
              created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, level INTEGER, total_coins INTEGER,
              current_streak INTEGER, longest_streak INTEGER, experience_points INTEGER,
              theme_preference TEXT, notification_enabled BOOLEAN, timezone TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Try to find existing user
  RETURN QUERY
  WITH upserted_user AS (
    INSERT INTO users (telegram_id, username, full_name, avatar_url, telegram_auth_data)
    VALUES (p_telegram_id, p_username, p_full_name, p_avatar_url, p_auth_data)
    ON CONFLICT (telegram_id)
    DO UPDATE SET
      username = EXCLUDED.username,
      full_name = EXCLUDED.full_name,
      avatar_url = EXCLUDED.avatar_url,
      telegram_auth_data = EXCLUDED.telegram_auth_data,
      updated_at = NOW()
    RETURNING *
  )
  SELECT
    uu.user_id, uu.telegram_id, uu.username, uu.full_name, uu.avatar_url,
    uu.created_at, uu.updated_at, uu.level, uu.total_coins,
    uu.current_streak, uu.longest_streak, uu.experience_points,
    uu.theme_preference, uu.notification_enabled, uu.timezone
  FROM upserted_user uu;

  RETURN;
END;
$$;

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_user_id UUID)
RETURNS TABLE (
  daily_progress NUMERIC,
  weekly_progress NUMERIC,
  today_tasks_count BIGINT,
  completed_today_count BIGINT,
  current_streak INTEGER,
  coins_earned_today BIGINT,
  level INTEGER,
  experience_points INTEGER,
  next_level_at INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_date DATE := CURRENT_DATE;
  v_week_start DATE := CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER;
BEGIN
  RETURN QUERY
  WITH user_data AS (
    SELECT
      u.level,
      u.experience_points,
      u.current_streak,
      u.total_coins
    FROM users u
    WHERE u.user_id = p_user_id
  ),
  daily_tasks AS (
    SELECT
      t.task_id,
      t.is_active
    FROM tasks t
    WHERE t.user_id = p_user_id
      AND t.is_active = true
      AND (
        t.recurrence_type = 'daily'
        OR (
          t.recurrence_type = 'weekly'
          AND t.recurrence_config->'days' ? lower(to_char(v_current_date, 'Day'))
        )
        OR t.recurrence_type = 'none'
      )
  ),
  completed_today AS (
    SELECT COUNT(*) as count
    FROM completed_tasks ct
    WHERE ct.user_id = p_user_id
      AND ct.completion_date = v_current_date
  ),
  weekly_completed AS (
    SELECT COUNT(*) as count
    FROM completed_tasks ct
    WHERE ct.user_id = p_user_id
      AND ct.completion_date >= v_week_start
  ),
  weekly_total AS (
    SELECT COUNT(DISTINCT ct.completion_date) as count
    FROM completed_tasks ct
    WHERE ct.user_id = p_user_id
      AND ct.completion_date >= v_week_start
  ),
  coins_today AS (
    SELECT COALESCE(SUM(ct.coins_earned + ct.streak_bonus + ct.completion_bonus), 0) as total
    FROM completed_tasks ct
    WHERE ct.user_id = p_user_id
      AND ct.completion_date = v_current_date
  )
  SELECT
    CASE
      WHEN (SELECT COUNT(*) FROM daily_tasks) = 0 THEN 0
      ELSE ROUND((SELECT count FROM completed_today)::NUMERIC / (SELECT COUNT(*) FROM daily_tasks) * 100, 2)
    END as daily_progress,
    CASE
      WHEN (SELECT count FROM weekly_total) = 0 THEN 0
      ELSE ROUND((SELECT count FROM weekly_completed)::NUMERIC / ((SELECT count FROM weekly_total) * 7) * 100, 2)
    END as weekly_progress,
    (SELECT COUNT(*) FROM daily_tasks) as today_tasks_count,
    (SELECT count FROM completed_today) as completed_today_count,
    ud.current_streak,
    (SELECT total FROM coins_today) as coins_earned_today,
    ud.level,
    ud.experience_points,
    ud.level * 100 as next_level_at
  FROM user_data ud;

  RETURN;
END;
$$;

-- Function to get task statistics for analytics
CREATE OR REPLACE FUNCTION get_task_analytics(
  p_user_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  category TEXT,
  task_count BIGINT,
  completion_rate NUMERIC,
  total_coins BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH task_categories AS (
    SELECT unnest(ARRAY['sport', 'health', 'work', 'learning', 'rest', 'personal']) as category
  ),
  task_stats AS (
    SELECT
      tc.category,
      COUNT(DISTINCT t.task_id) as task_count,
      COUNT(DISTINCT ct.completion_id) as completed_count,
      COALESCE(SUM(ct.coins_earned + ct.streak_bonus + ct.completion_bonus), 0) as total_coins
    FROM task_categories tc
    LEFT JOIN tasks t ON tc.category = t.category
      AND t.user_id = p_user_id
      AND t.is_active = true
    LEFT JOIN completed_tasks ct ON t.task_id = ct.task_id
      AND (p_start_date IS NULL OR ct.completion_date >= p_start_date)
      AND (p_end_date IS NULL OR ct.completion_date <= p_end_date)
    GROUP BY tc.category
  )
  SELECT
    ts.category,
    ts.task_count,
    CASE
      WHEN ts.task_count = 0 THEN 0
      ELSE ROUND((ts.completed_count::NUMERIC / ts.task_count) * 100, 2)
    END as completion_rate,
    ts.total_coins
  FROM task_stats ts
  ORDER BY ts.task_count DESC NULLS LAST;

  RETURN;
END;
$$;

-- Function to check and process achievements
CREATE OR REPLACE FUNCTION process_achievement_check(p_user_id UUID, p_achievement_type TEXT, p_progress_value INTEGER)
RETURNS TABLE (
  achievement_id UUID,
  is_new_unlock BOOLEAN,
  coins_awarded INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_achievement_id UUID;
  v_was_unlocked BOOLEAN;
  v_target_value INTEGER;
  v_coins_awarded INTEGER := 0;
BEGIN
  -- Get or create achievement record
  INSERT INTO achievements (user_id, achievement_type, target_value)
  VALUES (p_user_id, p_achievement_type, get_achievement_target(p_achievement_type))
  ON CONFLICT (user_id, achievement_type)
  DO NOTHING
  RETURNING achievement_id, is_unlocked INTO v_achievement_id, v_was_unlocked;

  -- If achievement already exists, get current state
  IF v_achievement_id IS NULL THEN
    SELECT achievement_id, is_unlocked INTO v_achievement_id, v_was_unlocked
    FROM achievements
    WHERE user_id = p_user_id AND achievement_type = p_achievement_type;
  END IF;

  -- Update progress
  UPDATE achievements
  SET progress_value = GREATEST(progress_value, p_progress_value)
  WHERE achievement_id = v_achievement_id;

  -- Check if should unlock
  IF NOT v_was_unlocked AND p_progress_value >= get_achievement_target(p_achievement_type) THEN
    UPDATE achievements
    SET is_unlocked = true, unlocked_at = NOW()
    WHERE achievement_id = v_achievement_id;

    v_coins_awarded := get_achievement_reward(p_achievement_type);
    v_was_unlocked := true;
  END IF;

  RETURN QUERY
  SELECT v_achievement_id, COALESCE(v_was_unlocked, false), v_coins_awarded;

  RETURN;
END;
$$;

-- Helper function to get achievement target values
CREATE OR REPLACE FUNCTION get_achievement_target(p_achievement_type TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN CASE p_achievement_type
    WHEN 'first_task' THEN 1
    WHEN 'week_warrior' THEN 7
    WHEN 'month_master' THEN 30
    WHEN 'task_champion' THEN 100
    WHEN 'perfect_week' THEN 7
    ELSE 1
  END;
END;
$$;

-- Helper function to get achievement coin rewards
CREATE OR REPLACE FUNCTION get_achievement_reward(p_achievement_type TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN CASE p_achievement_type
    WHEN 'first_task' THEN 10
    WHEN 'week_warrior' THEN 50
    WHEN 'month_master' THEN 200
    WHEN 'task_champion' THEN 100
    WHEN 'perfect_week' THEN 30
    ELSE 10
  END;
END;
$$;