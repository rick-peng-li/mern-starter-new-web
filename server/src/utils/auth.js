import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function serializeUser(user) {
  return {
    id: user._id?.toString() || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function createAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id?.toString() || user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    env.jwtSecret,
    { expiresIn: '7d' }
  );
}
