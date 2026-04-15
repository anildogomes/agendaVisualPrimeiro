
import { createClient } from '@supabase/supabase-js'
import { mockSupabase } from './mockSupabase';

// Helper function to safely access environment variables in different environments
const getEnvVar = (key: string) => {
    try {
        // Try import.meta.env (Vite standard)
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
            // @ts-ignore
            return import.meta.env[key];
        }
    } catch (e) {
        // Ignore error
    }

    try {
        // Try process.env (Node/Webpack standard fallback)
        // @ts-ignore
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            // @ts-ignore
            return process.env[key];
        }
    } catch (e) {
        // Ignore error
    }

    return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
    console.error('ERRO CRÍTICO: Variáveis de ambiente do Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) não encontradas. Verifique seu arquivo .env ou a configuração do servidor.');
}

// Fallback values prevent crash on init (createClient throws if URL is empty), 
// though connection will fail later if keys are actually missing.
const realSupabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseKey || 'placeholder-key'
);

// Switch between real and mock based on localStorage flag
const isMockMode = typeof window !== 'undefined' && localStorage.getItem('is_mock_logged_in') === 'true';

export const supabase = isMockMode ? mockSupabase : realSupabase;
