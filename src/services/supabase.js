import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../constants';

const supabaseUrl = SUPABASE_CONFIG.url;
const supabaseAnonKey = SUPABASE_CONFIG.anonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
