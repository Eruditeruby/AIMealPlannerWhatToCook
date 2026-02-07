# Deployment Guide — AI Meal Planner

This guide walks you through deploying the app to [Railway](https://railway.app) using Docker.

## Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Client     │ ──── │   Server     │ ──── │   MongoDB    │
│  (Next.js)   │      │  (Express)   │      │  (Railway)   │
│  Port 3000   │      │  Port 5000   │      │              │
└──────────────┘      └──────────────┘      └──────────────┘
    Dockerfile            Dockerfile           Railway Plugin
```

## Prerequisites

Before deploying, you need API keys from four services:

### 1. Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URI: `https://<your-server>.up.railway.app/api/auth/google/callback`
   (you'll update this after deploying the server)
7. Copy the **Client ID** and **Client Secret**

### 2. Spoonacular API Key

1. Go to [spoonacular.com/food-api](https://spoonacular.com/food-api)
2. Sign up for a free account
3. Go to **My Console** → **Profile**
4. Copy your **API Key**
5. Free tier: 150 requests/day

### 3. OpenRouter API Key

1. Go to [openrouter.ai](https://openrouter.ai/)
2. Sign up and go to **Keys**
3. Click **Create Key**
4. Copy the key
5. Free models are available (used as fallback when Spoonacular returns few results)

### 4. JWT Secret

Generate a random secret string. You can use:

```bash
openssl rand -base64 32
```

## Deploy to Railway

### Step 1: Create Railway Project

1. Sign up at [railway.app](https://railway.app) (GitHub login recommended)
2. Click **New Project**

### Step 2: Add MongoDB

1. In your project, click **New** → **Database** → **MongoDB**
2. Railway provisions a MongoDB instance automatically
3. Note: the connection string is available as a reference variable `${{MongoDB.MONGO_URL}}`

### Step 3: Deploy the Server

1. Click **New** → **GitHub Repo** → select `AIMealPlannerWhatToCook`
2. In the service settings:
   - Set **Root Directory** to `server`
   - Railway auto-detects the Dockerfile
3. Add environment variables (click **Variables**):

   | Variable | Value |
   |----------|-------|
   | `MONGODB_URI` | `${{MongoDB.MONGO_URL}}` (click "Add Reference") |
   | `JWT_SECRET` | Your generated secret |
   | `GOOGLE_CLIENT_ID` | From Google Cloud Console |
   | `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
   | `GOOGLE_CALLBACK_URL` | `https://<server-domain>.up.railway.app/api/auth/google/callback` |
   | `SPOONACULAR_API_KEY` | From Spoonacular |
   | `OPENROUTER_API_KEY` | From OpenRouter |
   | `NODE_ENV` | `production` |

4. Go to **Settings** → **Networking** → **Generate Domain** to get the public URL
5. Update `GOOGLE_CALLBACK_URL` with the actual domain

### Step 4: Deploy the Client

1. Click **New** → **GitHub Repo** → select `AIMealPlannerWhatToCook` again
2. In the service settings:
   - Set **Root Directory** to `client`
   - Railway auto-detects the Dockerfile
3. Add environment variables:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://<server-domain>.up.railway.app/api` |

4. Go to **Settings** → **Networking** → **Generate Domain** for the client URL

### Step 5: Update Google OAuth

Go back to [Google Cloud Console](https://console.cloud.google.com/) → **Credentials** → your OAuth client:

1. Add the server's Railway URL to **Authorized redirect URIs**:
   ```
   https://<server-domain>.up.railway.app/api/auth/google/callback
   ```
2. Add the client's Railway URL to **Authorized JavaScript origins**:
   ```
   https://<client-domain>.up.railway.app
   ```

## Verify Deployment

1. **Health check**: Visit `https://<server-domain>.up.railway.app/api/health` — should return `{"status":"ok"}`
2. **Client**: Visit `https://<client-domain>.up.railway.app` — the landing page should load
3. **Login**: Click the Google login button and complete the OAuth flow

## Environment Variables Summary

| Variable | Service | Description |
|----------|---------|-------------|
| `MONGODB_URI` | Server | MongoDB connection string |
| `JWT_SECRET` | Server | Secret for signing auth tokens |
| `GOOGLE_CLIENT_ID` | Server | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Server | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | Server | OAuth redirect URI |
| `SPOONACULAR_API_KEY` | Server | Recipe search API key |
| `OPENROUTER_API_KEY` | Server | AI recipe generation API key |
| `NODE_ENV` | Server | Set to `production` |
| `NEXT_PUBLIC_API_URL` | Client | Server API base URL |

## Troubleshooting

### Build fails on client

Check that the `NEXT_PUBLIC_API_URL` variable is set. Next.js inlines `NEXT_PUBLIC_*` vars at build time, so it must be available during the Docker build. In Railway, variables set in the dashboard are available during build.

### Google OAuth redirect mismatch

The `GOOGLE_CALLBACK_URL` env var must exactly match one of the authorized redirect URIs in Google Cloud Console, including the protocol (`https://`) and path.

### MongoDB connection refused

Ensure you're using Railway's reference variable `${{MongoDB.MONGO_URL}}` rather than a hardcoded string. Click **Add Reference** when adding the variable.

### Cold starts / slow first request

Railway's free tier may sleep inactive services. The first request after sleeping takes a few seconds. Upgrade to a paid plan to keep services always on.
