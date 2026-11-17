import { createClient, SupabaseClient } from "@supabase/supabase-js";
import logger from "./logger.js";
import dotenv from "dotenv";
dotenv.config();

const config = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || "").split(","),
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000,
    max: 100000000000,
  },
};

if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("upabase not configured: Missing URL or service role key");
}

const supabase: SupabaseClient = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);

logger.info("Supabase client initialized");

export default supabase;
