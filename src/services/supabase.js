import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../constants';

const supabaseUrl = SUPABASE_CONFIG.url;
const supabaseAnonKey = SUPABASE_CONFIG.anonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'etherialsoul-auth-token',
        flowType: 'pkce',
    },
    global: {
        headers: {
            'x-client-info': 'etherialsoul-client',
        },
    },
});
