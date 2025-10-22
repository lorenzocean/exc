# Mirage Deployment Guide

## Quick Fix for "/.env: not found" Error

If you're seeing this error on Render or other Docker platforms:
```
error: failed to solve: failed to compute cache key: "/.env": not found
```

### Solution 1: Clear Build Cache (Recommended)

**On Render:**
1. Go to your service dashboard
2. Click "Manual Deploy" → "Clear build cache & deploy"
3. This forces a complete rebuild without cached layers

**On Docker locally:**
```bash
docker build --no-cache -t mirage-app .
```

### Solution 2: Force Rebuild

Add a dummy comment to the Dockerfile to change its checksum:
```bash
echo "# Force rebuild $(date)" >> Dockerfile
git add Dockerfile
git commit -m "force: rebuild without cache"
git push
```

## Environment Variables Setup

### Required Variables

Add these in your platform's dashboard (NOT in code):

```bash
# Required for Mirage Hybrid model
DIFY_API_KEY=your_dify_api_key_here

# AI API Keys (as needed)
XAI_API_KEY=your_xai_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GROQ_API_KEY=your_groq_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

# Database & Storage
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url
BLOB_READ_WRITE_TOKEN=your_blob_token

# Authentication
BETTER_AUTH_SECRET=your_secret_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Search APIs
TAVILY_API_KEY=your_tavily_api_key
EXA_API_KEY=your_exa_api_key
FIRECRAWL_API_KEY=your_firecrawl_api_key
```

### Platform-Specific Instructions

#### Vercel
1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Select environments (Production, Preview, Development)
4. Click "Save"
5. Redeploy

#### Render
1. Go to your service → Environment
2. Add all required variables as "Environment Variables"
3. Do NOT use "Secret Files" for .env
4. Click "Save Changes"
5. Render will auto-deploy

#### Railway
1. Go to your project → Variables
2. Add all required variables
3. Variables are automatically applied
4. Redeploy if needed

#### Docker (Local/VPS)
```bash
# Create .env.local (gitignored)
cp .env.example .env.local
# Edit with your values
nano .env.local

# Run with env file
docker run -p 3000:3000 --env-file .env.local mirage-app

# Or pass individually
docker run -p 3000:3000 \
  -e DIFY_API_KEY=xxx \
  -e DATABASE_URL=xxx \
  mirage-app
```

## Build Process

### What Happens During Build

1. **Stage 1 (deps)**: Installs dependencies
2. **Stage 2 (builder)**: Builds Next.js app
   - ⚠️ NO .env files are copied (see .dockerignore)
   - Environment variables from platform are used
3. **Stage 3 (runner)**: Creates minimal runtime image

### Files Excluded from Build

See `.dockerignore`:
- `.env*` files (all variants)
- `node_modules/`
- `.next/`
- `.git/`
- Log files
- IDE configs

## Troubleshooting

### Cache Issues

**Problem**: Old Dockerfile version cached
**Solution**: Clear build cache (see above)

### Missing Environment Variables

**Problem**: App crashes with "Cannot read property of undefined"
**Solution**: Check all required env vars are set in platform dashboard

### Build Timeout

**Problem**: Build takes too long
**Solution**:
- Use Render's Pro plan for more build minutes
- Optimize dependencies in package.json
- Consider prebuild on CI/CD

### Port Issues

**Problem**: App not accessible
**Solution**: Ensure PORT=3000 and HOSTNAME=0.0.0.0 are set

## Verification

After deployment, verify:

```bash
# Check app is running
curl https://your-app.onrender.com/

# Check API health
curl https://your-app.onrender.com/api/health

# Check models
curl https://your-app.onrender.com/api/models
```

## Support

If issues persist:
1. Check Render/Vercel logs
2. Verify all environment variables are set
3. Try manual deploy with clear cache
4. Check GitHub Actions (if using CI/CD)
