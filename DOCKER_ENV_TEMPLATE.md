# Docker Environment Configuration

When deploying with Docker Compose, create a `.env.docker` file with the following variables:

```bash
# MongoDB
MONGO_USER=admin
MONGO_PASSWORD=change_this_password

# Server (API)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# External APIs
SPOONACULAR_API_KEY=your-spoonacular-api-key
OPENROUTER_API_KEY=your-openrouter-api-key

# URLs
CLIENT_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Production URLs

When deploying to production, update these URLs:

```bash
CLIENT_URL=https://your-app.com
NEXT_PUBLIC_API_URL=https://api.your-app.com
GOOGLE_CALLBACK_URL=https://api.your-app.com/api/auth/google/callback
```

## Usage

```bash
# Create your environment file
cp DOCKER_ENV_TEMPLATE.md .env.docker
# Edit .env.docker with your actual values
# Then run:
docker-compose --env-file .env.docker up -d
```

## Security Notes

- Never commit `.env.docker` or any `.env` files to version control
- Use strong, unique passwords for production
- JWT_SECRET should be minimum 32 random characters
- Update Google OAuth callback URL in Google Cloud Console
