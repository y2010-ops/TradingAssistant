# API Keys Setup Guide

## 🔑 Where to Add API Keys

All API keys go in the **`.env`** file in the root directory of your project.

## 📋 Required vs Optional Keys

### ✅ **REQUIRED** (Free)
1. **Supabase** - Database (Free tier: 500MB)
2. **JWT_SECRET** - Security (Generate your own)

### 🆓 **OPTIONAL** (Free Tiers Available)
3. **Alpha Vantage** - Stock data (Free: 5 calls/min)
4. **News API** - Financial news (Free: 1,000 calls/day)
5. **Reddit API** - Social sentiment (Completely free)

### 💡 **ENHANCED** (Optional)
6. **Twitter API** - Social sentiment (Free tier available)
7. **OpenAI** - Enhanced AI (Has free tier)

## 🚀 Quick Setup Steps

### 1. Copy Environment File
```bash
cp .env.example .env
```

### 2. Get Supabase Keys (Required)
1. Go to [supabase.com](https://supabase.com)
2. Create free account
3. Create new project
4. Go to Settings → API
5. Copy these values to `.env`:
   - `VITE_SUPABASE_URL` (for frontend)
   - `VITE_SUPABASE_ANON_KEY` (for frontend)
   - `SUPABASE_URL` (for backend)
   - `SUPABASE_ANON_KEY` (for backend)
   - `SUPABASE_SERVICE_ROLE_KEY`

### 3. Generate JWT Secret (Required)
```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Add this to `.env` as `JWT_SECRET`

### 4. Get Free API Keys (Optional but Recommended)

#### Alpha Vantage (Stock Data)
1. Visit: https://www.alphavantage.co/support/#api-key
2. Enter email to get free key
3. Add to `.env`: `ALPHA_VANTAGE_API_KEY=your_key`

#### News API (Financial News)
1. Visit: https://newsapi.org/register
2. Create free account
3. Copy API key
4. Add to `.env`: `NEWS_API_KEY=your_key`

#### Reddit API (Social Sentiment)
1. Visit: https://www.reddit.com/prefs/apps
2. Click "Create App"
3. Choose "script" type
4. Copy Client ID and Secret
5. Add to `.env`:
   ```
   REDDIT_CLIENT_ID=your_client_id
   REDDIT_CLIENT_SECRET=your_client_secret
   ```

## 🔒 Security Best Practices

### ✅ DO:
- Keep `.env` file in `.gitignore`
- Use strong, unique JWT secret
- Rotate API keys periodically
- Use environment-specific keys

### ❌ DON'T:
- Commit `.env` to version control
- Share API keys publicly
- Use production keys in development
- Hard-code keys in source code

## 🧪 Testing Your Setup

### Test Database Connection
```bash
# Run this to test Supabase connection
npm run test-db
```

### Test API Keys
```bash
# Run this to test all API connections
npm run test-apis
```

### Test AI Models
```bash
# Run this to test AI functionality
./scripts/test-ai-models.js
```

## 🚨 Troubleshooting

### Common Issues:

#### 1. "Supabase connection failed"
- Check `SUPABASE_URL` format: `https://your-project.supabase.co`
- Verify `SUPABASE_ANON_KEY` is correct
- Ensure project is not paused

#### 2. "Alpha Vantage rate limit"
- Free tier: 5 calls/minute, 500/day
- Wait 12 seconds between calls
- Consider upgrading for higher limits

#### 3. "News API quota exceeded"
- Free tier: 1,000 calls/day
- Resets at midnight UTC
- Cache responses to reduce calls

#### 4. "JWT secret error"
- Generate new secret: `openssl rand -hex 64`
- Must be at least 32 characters
- Use only alphanumeric characters

## 📊 API Usage Monitoring

### Check Usage:
```bash
# Monitor API usage
npm run monitor-apis
```

### Rate Limiting:
The system automatically handles rate limits for free tiers:
- Alpha Vantage: 5 calls/minute
- News API: 1,000 calls/day
- Reddit: No official limits

## 🎯 Production Deployment

### Environment Variables:
When deploying, set these environment variables:
- All `.env` values
- `NODE_ENV=production`
- Strong `JWT_SECRET`
- Production database URLs

### Security Checklist:
- [ ] `.env` not in repository
- [ ] Strong JWT secret (64+ characters)
- [ ] API keys are production-ready
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] HTTPS enabled

## 💰 Cost Optimization

### Free Tier Limits:
- **Supabase**: 500MB database, 2GB bandwidth
- **Alpha Vantage**: 500 calls/day
- **News API**: 1,000 calls/day
- **Reddit**: Unlimited (rate limited)

### Optimization Tips:
1. **Cache responses** to reduce API calls
2. **Batch requests** when possible
3. **Use local AI models** to avoid API costs
4. **Monitor usage** to stay within limits

## 🔄 Key Rotation

### Monthly Rotation:
1. Generate new JWT secret
2. Update in production environment
3. Test all functionality

### API Key Rotation:
1. Generate new API keys
2. Update `.env` file
3. Deploy changes
4. Revoke old keys

## 📞 Support

### Getting Help:
- Check logs: `tail -f logs/trading-assistant.log`
- Test individual components
- Review error messages
- Check API provider status pages

### Common Resources:
- [Supabase Docs](https://supabase.com/docs)
- [Alpha Vantage Docs](https://www.alphavantage.co/documentation/)
- [News API Docs](https://newsapi.org/docs)
- [Reddit API Docs](https://www.reddit.com/dev/api/)