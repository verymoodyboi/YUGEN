import dotenv from 'dotenv';
dotenv.config(); // MUST be first

const config = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || '').split(','),
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000,
    max: 1000,
  },
};

export default config;
