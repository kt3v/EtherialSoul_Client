// Development mode flag
let isDev = true;

// Auto-detect environment - force production if not on localhost
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
if (!isLocalhost) {
    isDev = false;
}

// Backend WebSocket server URL
export const SOCKET_URL = isDev ? 'http://localhost:3000' : 'https://etherial-vqt7t.ondigitalocean.app';

// API configuration
export const API_CONFIG = {
    baseURL: isDev ? 'http://localhost:3000' : 'https://etherial-vqt7t.ondigitalocean.app',
    timeout: 10000,
};

// Supabase configuration
export const SUPABASE_CONFIG = {
    url: 'https://jzhzbgjgrrhelmdxvsqt.supabase.co',
    anonKey: 'sb_publishable_HzdMfCI4EDV0TPiM0o-YEg_-x_lay_V',
};

// Theme colors
export const COLORS = {
    background: '#0a0a0a',
    surface: '#1a1a1a',
    surfaceLight: '#252525',
    primary: '#8b5cf6',
    primaryDark: '#7c3aed',
    secondary: '#06b6d4',
    text: '#ffffff',
    textSecondary: '#a1a1aa',
    border: '#27272a',
    success: '#10b981',
    error: '#ef4444',
    userMessage: '#8b5cf6',
    aiMessage: '#1a1a1a',
};
