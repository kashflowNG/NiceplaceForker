
# Telegram Notifications Setup Guide

This application sends notifications via Telegram. To enable notifications when deployed on external platforms, you need to set up environment variables.

## Environment Variables Required

- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token (get from @BotFather)
- `TELEGRAM_CHAT_ID`: Your Telegram chat/user ID

## Platform-Specific Setup

### Replit Deployments
1. Go to Secrets in your Replit workspace
2. Add `TELEGRAM_BOT_TOKEN` with your bot token
3. Add `TELEGRAM_CHAT_ID` with your chat ID

### Vercel
1. Go to your project settings on Vercel
2. Navigate to Environment Variables
3. Add both variables with their values

### Netlify
1. Go to Site settings > Environment variables
2. Add both variables with their values

### Railway/Render/other platforms
1. Navigate to your app's environment variables section
2. Add both variables with their values

## Getting Your Telegram Credentials

### Bot Token
1. Message @BotFather on Telegram
2. Send `/newbot` and follow instructions
3. Copy the token provided

### Chat ID
1. Message your bot once
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Look for the `chat.id` in the response

## Testing
After setting up environment variables:
1. Redeploy your application
2. Test a login attempt
3. Check if you receive the Telegram notification

## Fallback
If environment variables are not set, the app will use the hardcoded values (for development only).
