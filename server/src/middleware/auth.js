import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { serializeUser } from '../utils/auth.js';

function getBearerToken(authorizationHeader = '') {
  if (!authorizationHeader.startsWith('Bearer ')) {
    return '';
  }

  return authorizationHeader.slice(7);
}

export async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).lean();

    if (!user) {
      return res.status(401).json({ message: 'Authentication expired.' });
    }

    req.user = serializeUser(user);
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid authentication token.' });
  }
}
