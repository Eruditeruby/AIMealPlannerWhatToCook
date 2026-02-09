const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { debugError } = require('./utils/debug');
const { configurePassport } = require('./config/passport');

const app = express();

// Initialize Passport Google strategy (skip if credentials missing, e.g. in tests)
if (process.env.GOOGLE_CLIENT_ID) {
  configurePassport();
}

// Trust proxy (Railway, Render, etc. run behind reverse proxies)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// Rate limiting — global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use(limiter);

// Auth-specific rate limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later' },
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// NoSQL injection prevention — sanitize req.body only (Express 5 req.query is read-only)
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
    return obj;
  };
  if (req.body) sanitize(req.body);
  next();
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/pantry', require('./routes/pantry'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/cooking', require('./routes/cooking'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler — hide stack traces in production
app.use((err, req, res, _next) => {
  debugError('[Error]', req.method, req.path, err.message);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(status).json({ error: message });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  const connectDB = require('./config/db');
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });
}

module.exports = app;
