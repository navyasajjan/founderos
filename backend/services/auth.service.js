import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config/env.js';
import User from '../models/user.model.js';

export const AuthService = {
  hashPassword: async (password) => {
    return bcrypt.hash(password, CONFIG.SALT_ROUNDS);
  },

  comparePasswords: async (password, hash) => {
    return bcrypt.compare(password, hash);
  },

  generateToken: (user) => {
    return jwt.sign(
      { id: user._id, email: user.email },
      CONFIG.JWT_SECRET,
      { expiresIn: CONFIG.TOKEN_EXPIRY }
    );
  },

  // ✅ FIXED
  findUserByEmail: async (email) => {
   if (!email) return null; // if email is missing, just return null
  return await User.findOne({ email: email.toLowerCase() });
  },

  // ✅ FIXED
  createUser: async (data) => {
    return await User.create(data);
  }
};
