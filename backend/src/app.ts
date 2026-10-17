import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { requireAuth } from './auth';
import { authRouter } from './routes/authRoutes';
import { courtRouter } from './routes/courtRoutes';
import { bookingRouter } from './routes/bookingRoutes';

export const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/courts', requireAuth, courtRouter);
app.use('/api/bookings', requireAuth, bookingRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'La ruta solicitada no existe.',
  });
});

app.use((err: Error & { status?: number; type?: string }, _req: Request, res: Response, _next: NextFunction) => {
  if (err && (err.type === 'entity.parse.failed' || err.status === 400)) {
    res.status(400).json({
      error: 'El formato de los datos enviados no es válido.',
    });
    return;
  }

  res.status(500).json({
    error: 'Ocurrió un problema inesperado al procesar tu solicitud. Por favor intenta nuevamente.',
  });
});
