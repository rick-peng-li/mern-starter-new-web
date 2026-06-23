import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { loginSchema, registerSchema } from '../validation/authSchema.js';
import { createAccessToken, serializeUser } from '../utils/auth.js';

export async function register(req, res, next) {
  try {
    const payload = registerSchema.parse(req.body);
    const existingUser = await User.findOne({ email: payload.email.toLowerCase() }).lean();

    if (existingUser) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await User.create({
      name: payload.name,
      email: payload.email.toLowerCase(),
      passwordHash,
      role: 'editor',
    });

    return res.status(201).json({
      token: createAccessToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await User.findOne({ email: payload.email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatched = await bcrypt.compare(payload.password, user.passwordHash);

    if (!passwordMatched) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.json({
      token: createAccessToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

export function me(req, res) {
  return res.json({ user: req.user });
}
