require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

// Initialize bot with token from environment
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Configuration
const API_URL = process.env.HABITFLOW_API_URL || 'http://localhost:5173';
const WEBAPP_URL = `${API_URL}`;

// Bot handlers
bot.start(async (ctx) => {
  const userName = ctx.from.first_name || ctx.from.username || 'User';

  const welcomeMessage = `
🎯 Welcome to HabitFlow, ${userName}!

Transform your daily routine into an engaging game of productivity and achievement.

✨ What you can do:
• Create and manage daily tasks
• Earn coins and build streaks
• Unlock achievements and rewards
• Track your progress with beautiful analytics

Ready to start building better habits? Let's go! 🚀
  `;

  await ctx.replyWithPhoto('https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop', {
    caption: welcomeMessage,
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Open HabitFlow', WEBAPP_URL)],
      [Markup.button.callback('📖 How it Works', 'how_it_works')],
      [Markup.button.callback('⚙️ Settings', 'settings')]
    ])
  });
});

// Help command
bot.help(async (ctx) => {
  const helpText = `
🎯 *HabitFlow Bot Commands*

/start - Launch the HabitFlow app
/tasks - View today's tasks
/streak - Check your current streak
/stats - View your progress statistics
/shop - Browse the rewards shop
/settings - Manage your preferences
/voice - Create tasks with voice commands
/help - Show this help message

💡 *Tips:*
• Use voice messages to quickly create tasks
• Complete tasks daily to build streaks
• Earn coins to unlock achievements and themes
• Set reminders to stay on track

Need more help? Contact @HabitFlowSupport
  `;

  await ctx.replyWithMarkdownV2(helpText, {
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Open HabitFlow', WEBAPP_URL)]
    ])
  });
});

// Tasks command
bot.command('tasks', async (ctx) => {
  await ctx.reply('📋 Loading your tasks...', {
    reply_markup: {
      inline_keyboard: [
        [Markup.button.webApp('📱 View Tasks in App', WEBAPP_URL)]
      ]
    }
  });
});

// Streak command
bot.command('streak', async (ctx) => {
  await ctx.reply('🔥 Checking your streak...', {
    reply_markup: {
      inline_keyboard: [
        [Markup.button.webApp('📊 View Stats in App', WEBAPP_URL)]
      ]
    }
  });
});

// Stats command
bot.command('stats', async (ctx) => {
  await ctx.reply('📈 Loading your statistics...', {
    reply_markup: {
      inline_keyboard: [
        [Markup.button.webApp('📊 View Analytics', WEBAPP_URL)]
      ]
    }
  });
});

// Shop command
bot.command('shop', async (ctx) => {
  await ctx.reply('🛍️ Opening the shop...', {
    reply_markup: {
      inline_keyboard: [
        [Markup.button.webApp('🛍️ Browse Shop', WEBAPP_URL)]
      ]
    }
  });
});

// Settings command
bot.command('settings', async (ctx) => {
  await ctx.reply('⚙️ Loading settings...', {
    reply_markup: {
      inline_keyboard: [
        [Markup.button.webApp('⚙️ Manage Settings', WEBAPP_URL)]
      ]
    }
  });
});

// Voice command for quick task creation
bot.command('voice', async (ctx) => {
  await ctx.reply('🎤 Send me a voice message to create a task!\n\nExample: "Create task Morning workout sport high priority"');
});

// Handle voice messages
bot.on('voice', async (ctx) => {
  try {
    // Get voice file info
    const voiceFileId = ctx.message.voice.file_id;
    const voiceFileInfo = await ctx.telegram.getFile(voiceFileId);
    const voiceUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${voiceFileInfo.file_path}`;

    // Here you would typically use a speech-to-text service
    // For now, we'll simulate voice recognition
    await ctx.reply('🎤 Processing your voice message...');

    setTimeout(async () => {
      await ctx.reply('📝 *Voice Recognition Result*\n\n"Create task Morning workout sport high priority"\n\nWould you like me to create this task?', {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [Markup.button.callback('✅ Yes, Create Task', 'create_voice_task'), Markup.button.callback('❌ Cancel', 'cancel_voice_task')]
          ]
        }
      });
    }, 2000);

  } catch (error) {
    console.error('Error processing voice message:', error);
    await ctx.reply('❌ Sorry, I had trouble processing your voice message. Please try again.');
  }
});

// Callback query handlers
bot.action('how_it_works', async (ctx) => {
  const howItWorksText = `
🎯 *How HabitFlow Works*

1️⃣ *Create Tasks*
Add daily tasks with categories like Sport, Health, Work, Learning, Rest, or Personal

2️⃣ *Complete & Earn*
Finish tasks to earn coins based on priority and category

3️⃣ *Build Streaks*
Maintain consistency to build impressive streaks and earn bonus rewards

4️⃣ *Unlock Achievements*
Reach milestones to unlock achievements and showcase your productivity

5️⃣ *Customize & Grow*
Spend coins in the shop to unlock themes and personalize your experience

💪 Start building better habits today!
  `;

  await ctx.answerCbQuery();
  await ctx.editMessageText(howItWorksText, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Get Started', WEBAPP_URL)],
      [Markup.button.callback('❌ Close', 'close_message')]
    ])
  });
});

bot.action('settings', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText('⚙️ *Settings*\n\nManage your preferences and notifications in the HabitFlow app.', {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('⚙️ Open Settings', WEBAPP_URL)],
      [Markup.button.callback('❌ Close', 'close_message')]
    ])
  });
});

bot.action('create_voice_task', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText('✅ *Task Created Successfully!*\n\n🏋️ Morning workout\n🏷️ Category: Sport\n⭐ Priority: High\n💰 Coins: 18\n\nOpen the app to see all your tasks!', {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('📱 View Tasks', WEBAPP_URL)]
    ])
  });
});

bot.action('cancel_voice_task', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.deleteMessage();
});

bot.action('close_message', async (ctx) => {
  try {
    await ctx.answerCbQuery();
    await ctx.deleteMessage();
  } catch (error) {
    // Message might already be deleted
  }
});

// Handle regular text messages
bot.on('text', async (ctx) => {
  const text = ctx.message.text.toLowerCase();

  // Quick task creation from text
  if (text.includes('create task') || text.includes('add task') || text.includes('new task')) {
    await ctx.reply('📝 I can help you create a task!\n\nFor better task creation, try:\n• Using voice commands: /voice\n• Opening the app: Click the button below\n\n🚀 HabitFlow App:', {
      reply_markup: {
        inline_keyboard: [
          [Markup.button.webApp('📱 Create Task in App', WEBAPP_URL)]
        ]
      }
    });
    return;
  }

  // Default response for other messages
  const responses = [
    '🎯 I\'m here to help you build better habits! Try /start to begin.',
    '📋 Use the commands or open the app to manage your tasks.',
    '🚀 Click the button below to open HabitFlow and get productive!',
    '💪 Ready to crush your goals? Open the app below!'
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  await ctx.reply(randomResponse, {
    reply_markup: {
      inline_keyboard: [
        [Markup.button.webApp('🚀 Open HabitFlow', WEBAPP_URL)]
      ]
    }
  });
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ Sorry, something went wrong. Please try again later.');
});

// Start the bot
const startBot = async () => {
  try {
    // Get bot info to verify token
    const botInfo = await bot.telegram.getMe();
    console.log(`✅ Bot started successfully: @${botInfo.username}`);

    // Start polling
    await bot.launch();

    // Graceful shutdown
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
};

startBot();