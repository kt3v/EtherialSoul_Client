// Development mode flag (only used when running on localhost)
// Set to true to connect to local server, false to connect to production server
let isDev = true; // Changed default to false for safety

// Auto-detect environment - check if running in web browser
const isWebBrowser = typeof window !== 'undefined' && window.location;
const isLocalhost = isWebBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Determine server URL based on environment
// If NOT on localhost (i.e., on hosting), ALWAYS use production server
// If on localhost, respect the isDev flag
const useLocalServer = isLocalhost && isDev;

// Debug logging
console.log('Environment debug:', {
    isWebBrowser,
    isLocalhost,
    isDev,
    useLocalServer,
    hostname: isWebBrowser ? window.location.hostname : 'N/A'
});

// Backend WebSocket server URL
export const SOCKET_URL = useLocalServer ? 'http://localhost:3000' : 'https://etherial-vqt7t.ondigitalocean.app';

// API configuration
export const API_CONFIG = {
    baseURL: useLocalServer ? 'http://localhost:3000' : 'https://etherial-vqt7t.ondigitalocean.app',
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
