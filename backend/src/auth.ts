import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthTokenPayload } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'padel-medellin-local-secret-key-2026';
export const AUTH_COOKIE_NAME = 'token';

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) {
    return false;
  }
  const [salt, keyHex] = parts;
  const keyBuffer = Buffer.from(keyHex, 'hex');
  const derivedBuffer = scryptSync(password, salt, 64);
  if (keyBuffer.length !== derivedBuffer.length) {
    return false;
  }
  return timingSafeEqual(keyBuffer, derivedBuffer);
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(
    {
      id: payload.id,
      fullName: payload.fullName,
      email: payload.email,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    if (decoded && typeof decoded.id === 'number' && decoded.email && decoded.fullName) {
      return {
        id: decoded.id,
        fullName: decoded.fullName,
        email: decoded.email,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function extractTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.slice(7).trim();
    if (bearerToken) {
      return bearerToken;
    }
  }
  if (req.cookies && typeof req.cookies[AUTH_COOKIE_NAME] === 'string') {
    return req.cookies[AUTH_COOKIE_NAME];
  }
  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractTokenFromRequest(req);
  if (!token) {
    res.status(401).json({
      error: 'Debes iniciar sesión para acceder a las reservas.',
    });
    return;
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    res.status(401).json({
      error: 'Debes iniciar sesión para acceder a las reservas.',
    });
    return;
  }

  req.user = payload;
  next();
}
