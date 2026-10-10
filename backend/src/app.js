import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter, requireCustomHeader } from './middleware/security.js';
import routes from './routes/index.js';

const app = express();

app.set('trust proxy', 1); // needed behind Render/Railway/Vercel proxies so secure cookies and rate limits work
app.use(helmet());
app.use(cors({ origin: env.clientOrigins, credentials: true }));

// Request logging WITHOUT bodies, query strings or cookies (they can contain medical data).
if (env.NODE_ENV !== 'test') {
  morgan.token('safe-path', (req) => (req.originalUrl || req.url).split('?')[0]);
  app.use(morgan(':method :safe-path :status :response-time ms'));
}

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(requireCustomHeader);

app.use('/api', apiLimiter, routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
