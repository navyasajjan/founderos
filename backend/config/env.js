
export const CONFIG = {
  PORT: process.env.PORT || 3001,
  JWT_SECRET: process.env.JWT_SECRET || 'founder-os-super-secret-key-2026',
  SALT_ROUNDS: 12,
  TOKEN_EXPIRY: '7d',
  // DATABASE_URI: 'mongodb://localhost:27017/founder_os' // Placeholder for actual DB
};
