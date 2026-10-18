import { Router } from 'express';
import { db } from '../../../db/client';
import {
  AUTH_COOKIE_NAME,
  extractTokenFromRequest,
  hashPassword,
  signAuthToken,
  verifyAuthToken,
  verifyPassword,
} from '../auth';

export const authRouter = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface UserRow {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

authRouter.post('/register', (req, res) => {
  try {
    const rawFullName = typeof req.body?.fullName === 'string' ? req.body.fullName.trim() : '';
    const rawEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const rawPassword = typeof req.body?.password === 'string' ? req.body.password : '';

    if (
      rawFullName.length < 2 ||
      !EMAIL_REGEX.test(rawEmail) ||
      rawPassword.length < 8
    ) {
      res.status(400).json({
        error: 'Por favor ingresa un nombre válido, un correo válido y una contraseña de al menos 8 caracteres.',
      });
      return;
    }

    const existingUser = db
      .prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE')
      .get(rawEmail) as { id: number } | undefined;

    if (existingUser) {
      res.status(409).json({
        error: 'Ya existe una cuenta registrada con este correo electrónico.',
      });
      return;
    }

    const passwordHash = hashPassword(rawPassword);
    const insertResult = db
      .prepare('INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)')
      .run(rawFullName, rawEmail, passwordHash);

    const userId = Number(insertResult.lastInsertRowid);
    const userPayload = {
      id: userId,
      fullName: rawFullName,
      email: rawEmail,
    };

    const token = signAuthToken(userPayload);
    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: userPayload,
      token,
    });
  } catch (err: unknown) {
    const sqliteErr = err as { code?: string };
    if (sqliteErr && typeof sqliteErr.code === 'string' && sqliteErr.code.startsWith('SQLITE_CONSTRAINT')) {
      res.status(409).json({
        error: 'Ya existe una cuenta registrada con este correo electrónico.',
      });
      return;
    }
    res.status(500).json({
      error: 'No se pudo completar el registro en este momento. Intenta nuevamente.',
    });
  }
});

authRouter.post('/login', (req, res) => {
  try {
    const rawEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const rawPassword = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!rawEmail || !rawPassword) {
      res.status(400).json({
        error: 'Debes ingresar tu correo electrónico y contraseña.',
      });
      return;
    }

    const userRow = db
      .prepare('SELECT id, full_name, email, password_hash, created_at FROM users WHERE email = ? COLLATE NOCASE')
      .get(rawEmail) as UserRow | undefined;

    if (!userRow || !verifyPassword(rawPassword, userRow.password_hash)) {
      res.status(401).json({
        error: 'Correo electrónico o contraseña incorrectos.',
      });
      return;
    }

    const userPayload = {
      id: userRow.id,
      fullName: userRow.full_name,
      email: userRow.email,
    };

    const token = signAuthToken(userPayload);
    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      user: userPayload,
      token,
    });
  } catch {
    res.status(500).json({
      error: 'No se pudo iniciar sesión en este momento. Intenta nuevamente.',
    });
  }
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.status(200).json({
    message: 'Sesión cerrada correctamente.',
  });
});

authRouter.get('/me', (req, res) => {
  const token = extractTokenFromRequest(req);
  if (!token) {
    res.status(401).json({
      error: 'Sesión no válida o expirada.',
    });
    return;
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    res.status(401).json({
      error: 'Sesión no válida o expirada.',
    });
    return;
  }

  const userRow = db
    .prepare('SELECT id, full_name, email FROM users WHERE id = ?')
    .get(payload.id) as { id: number; full_name: string; email: string } | undefined;

  if (!userRow) {
    res.status(401).json({
      error: 'Sesión no válida o expirada.',
    });
    return;
  }

  res.status(200).json({
    user: {
      id: userRow.id,
      fullName: userRow.full_name,
      email: userRow.email,
    },
  });
});
