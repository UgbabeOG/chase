import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", FRONTEND_URL],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' } },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many login attempts, please try again later' } },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/login/2fa', authLimiter);
app.use('/api/auth/setup-2fa', authLimiter);
app.use('/api/auth/verify-2fa', authLimiter);
app.use('/api', limiter);

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
});

export default app;