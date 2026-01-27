import { createClient, SupabaseClient } from '@supabase/supabase-js';
import logger from './logger.js';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || '').split(','),
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000,
    max: 100000000000,
  },
};



const supabaseA: SupabaseClient = createClient(
  "https://iqvsgbsnpqvbddmdixoz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdnNnYnNucHF2YmRkbWRpeG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODIwMDAsImV4cCI6MjA2MTg1ODAwMH0.gXi9u1QIXf9gJkNvCGZror9pkJu-U0nPeerZN7F-Gzw",
);

logger.info('Supabase client initialized');

export default supabaseA;
