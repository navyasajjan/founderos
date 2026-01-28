import jwt from 'jsonwebtoken';
import { CONFIG } from '../config/env.js';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ error: 'Authorization denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET);

    // 🔥 MongoDB lookup (NOT array.find)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res
        .status(404)
        .json({ error: 'User associated with this token no longer exists.' });
    }

    // Attach user to request
    req.user = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error(err);
    return res
      .status(401)
      .json({ error: 'Session expired or invalid token.' });
  }
};
