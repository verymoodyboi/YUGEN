import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '../config/index.js';
import logger from './logger.js';


const supabaseA: SupabaseClient = createClient(
  "https://iqvsgbsnpqvbddmdixoz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdnNnYnNucHF2YmRkbWRpeG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODIwMDAsImV4cCI6MjA2MTg1ODAwMH0.gXi9u1QIXf9gJkNvCGZror9pkJu-U0nPeerZN7F-Gzw",
);

logger.info('Supabase client initialized');

export default supabaseA;
