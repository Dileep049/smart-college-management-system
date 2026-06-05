import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.routes';
import { errorHandler } from './middleware/errorHandler';
import { NotFoundError } from './utils/errors';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing API
app.use('/api', apiRouter);

// Fallback 404 Route
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Requested route ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(errorHandler);

export default app;
