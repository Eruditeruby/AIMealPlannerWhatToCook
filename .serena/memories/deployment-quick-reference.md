# Deployment Quick Reference

## Production Readiness Checklist

### Environment Setup
- [ ] MongoDB URI (MongoDB Atlas recommended)
- [ ] JWT_SECRET (32+ characters, use `openssl rand -base64 32`)
- [ ] Google OAuth credentials + callback URL
- [ ] Spoonacular API key (150 req/day free tier)
- [ ] OpenRouter API key (free tier available)

### Deployment Options

#### Option 1: Docker Compose (Recommended for VPS)
```bash
# 1. Configure environment
cp .env.docker.example .env.docker
# Edit .env.docker with production values

# 2. Start services
docker-compose --env-file .env.docker up -d

# 3. View logs
docker-compose logs -f

# 4. Stop services
docker-compose down
```

**URLs**:
- Client: http://localhost:3000
- Server: http://localhost:5000
- MongoDB: localhost:27017

#### Option 2: Railway (Recommended for Cloud)
1. Create Railway project
2. Add MongoDB plugin ("New" → "Database" → "MongoDB")
3. Add two services from GitHub:
   - Server: root directory = `server/`
   - Client: root directory = `client/`
4. Configure environment variables on each service
5. Update URLs:
   - `GOOGLE_CALLBACK_URL`: `https://<server>.up.railway.app/api/auth/google/callback`
   - `NEXT_PUBLIC_API_URL`: `https://<server>.up.railway.app`
   - `CLIENT_URL`: `https://<client>.up.railway.app`
6. Update Google Cloud Console with Railway callback URL
7. Deploy automatically on push to main

#### Option 3: Manual Deployment
**Server**:
```bash
cd server
npm ci --omit=dev
NODE_ENV=production node index.js
```

**Client**:
```bash
cd client
npm ci
npm run build
npm start
```

## Environment Variables

### Server (Required)
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — Secret for JWT signing (32+ chars)
- `GOOGLE_CLIENT_ID` — Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret
- `GOOGLE_CALLBACK_URL` — OAuth callback URL
- `SPOONACULAR_API_KEY` — Spoonacular API key
- `OPENROUTER_API_KEY` — OpenRouter API key
- `CLIENT_URL` — Client URL for CORS

### Client (Required)
- `NEXT_PUBLIC_API_URL` — API base URL

### Optional
- `DEBUG=true` — Enable server debug logging
- `NEXT_PUBLIC_DEBUG=true` — Enable client debug logging
- `PORT=5000` — Server port (default: 5000)
- `JWT_EXPIRES_IN=7d` — JWT expiration (default: 7d)

## Security Configuration

### JWT Cookies
- ✅ httpOnly: true (prevents XSS)
- ✅ secure: true in production (HTTPS-only)
- ✅ sameSite: 'none' in production, 'lax' in dev
- ✅ 7-day expiration

### Rate Limiting
- ✅ Global: 100 requests per 15 minutes
- ✅ Auth: 10 requests per 15 minutes

### CORS
- ✅ Restricted to CLIENT_URL
- ✅ Credentials: true (for cookies)

### Input Sanitization
- ✅ NoSQL injection prevention
- ✅ Request body size limit: 10kb

## Health Checks

### Server Health
```bash
curl http://localhost:5000/api/health
# Expected: {"status":"ok"}
```

### MongoDB Connection
```bash
# Check server logs for:
# "MongoDB connected: <host>"
```

### Client Build
```bash
cd client
npm run build
# Should complete without errors
```

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**:
- Verify MONGODB_URI is correct
- Check network access (whitelist IP for MongoDB Atlas)
- Ensure MongoDB is running (Docker Compose)

**Google OAuth Not Working**:
- Verify callback URL matches Google Cloud Console
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Ensure credentials are enabled

**CORS Errors**:
- Update CLIENT_URL to match client domain
- Verify NEXT_PUBLIC_API_URL points to server

**Rate Limit Exceeded**:
- Spoonacular: 150 requests/day on free tier
- OpenRouter: Check free tier limits
- Consider caching to reduce API calls

## Monitoring

### Logs
```bash
# Docker Compose
docker-compose logs -f server
docker-compose logs -f client

# PM2 (manual deployment)
pm2 logs server
pm2 logs client
```

### Metrics to Watch
- API response times
- Spoonacular API usage (150/day limit)
- OpenRouter token usage
- MongoDB connection pool
- Error rates

## Backup & Recovery

### MongoDB Backup
```bash
# Docker Compose
docker exec aimealplanner-mongodb mongodump --out /backup

# Manual
mongodump --uri="<MONGODB_URI>" --out /backup
```

### Environment Backup
- Keep `.env` files secure and backed up
- Store secrets in a password manager
- Document all environment variable values

---

**Quick Deploy**: `docker-compose --env-file .env.docker up -d`
**Quick Stop**: `docker-compose down`
**Quick Logs**: `docker-compose logs -f`
