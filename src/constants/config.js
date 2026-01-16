// Development mode flag (only used when running on localhost)
// Set to true to connect to local server, false to connect to production server
let isDev = true;

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
    timeout: 45000,
};

// Supabase configuration
export const SUPABASE_CONFIG = {
    url: 'https://jzhzbgjgrrhelmdxvsqt.supabase.co',
    anonKey: 'sb_publishable_HzdMfCI4EDV0TPiM0o-YEg_-x_lay_V',
};
