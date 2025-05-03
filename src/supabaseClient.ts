
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project-id.supabase.co';
const supabaseKey = 'your-anon-or-service-role-key'; // Use anon key for frontend
export const supabase = createClient(supabaseUrl, supabaseKey);
