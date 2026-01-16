import { API_CONFIG } from '../constants/config';
import { calculateCelestialBodies } from './astrologyService';

const DAILY_FORECAST_CACHE_KEY = 'etherial.dailyForecast.v1';
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

let memoryCache = null;

async function getStorage() {
    try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        if (AsyncStorage?.getItem && AsyncStorage?.setItem) {
            return {
                getItem: AsyncStorage.getItem,
                setItem: AsyncStorage.setItem,
                removeItem: AsyncStorage.removeItem,
                name: 'AsyncStorage',
            };
        }
    } catch (e) {
        // ignore
    }

    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
        return {
            getItem: async (key) => globalThis.localStorage.getItem(key),
            setItem: async (key, value) => globalThis.localStorage.setItem(key, value),
            removeItem: async (key) => globalThis.localStorage.removeItem(key),
            name: 'localStorage',
        };
    }

    return {
        getItem: async () => (memoryCache ? JSON.stringify(memoryCache) : null),
        setItem: async (_key, value) => {
            try {
                memoryCache = JSON.parse(value);
            } catch {
                memoryCache = null;
            }
        },
        removeItem: async () => {
            memoryCache = null;
        },
        name: 'memory',
    };
}

async function readCachedDailyForecast() {
    const storage = await getStorage();
    const raw = await storage.getItem(DAILY_FORECAST_CACHE_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        if (!parsed?.forecast || !parsed?.savedAt) return null;
        return parsed;
    } catch {
        return null;
    }
}

async function writeCachedDailyForecast({ forecast, timestamp }) {
    const storage = await getStorage();
    const payload = {
        forecast,
        timestamp: timestamp || new Date().toISOString(),
        savedAt: Date.now(),
    };
    await storage.setItem(DAILY_FORECAST_CACHE_KEY, JSON.stringify(payload));
    return payload;
}

/**
 * Fetch daily astrological forecast (cached).
 * - If cached forecast is newer than 3 hours: return cached (no server call)
 * - Otherwise: calculate transit chart, call backend, save to cache
 */
export const fetchDailyForecast = async () => {
    try {
        const cached = await readCachedDailyForecast();
        if (cached && Date.now() - cached.savedAt < THREE_HOURS_MS) {
            console.log('[dailyForecast] Using cached daily forecast (fresh < 3h)');
            return {
                forecast: cached.forecast,
                timestamp: cached.timestamp,
                fromCache: true,
                transitChart: null,
            };
        }

        console.log('[dailyForecast] Cache miss/stale. Fetching new daily forecast...');
        
        // Calculate current planetary positions (transit chart)
        // Using current time and coordinates (0,0 for universal positions)
        const now = new Date();
        const transitChart = calculateCelestialBodies(
            now.toISOString(),
            0, // latitude (universal)
            0  // longitude (universal)
        );

        console.log('[dailyForecast] Transit chart calculated:', {
            timestamp: now.toISOString(),
            planets: Object.keys(transitChart)
        });

        // Send to backend for interpretation
        const response = await fetch(`${API_CONFIG.baseURL}/daily-forecast`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transitChart
            }),
            signal: AbortSignal.timeout(API_CONFIG.timeout)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        console.log('[dailyForecast] Forecast received:', {
            timestamp: data.timestamp,
            forecastLength: data.forecast?.length || 0
        });
        console.log('[dailyForecast] Forecast text:', data.forecast);

        const cachedWritten = await writeCachedDailyForecast({
            forecast: data.forecast,
            timestamp: data.timestamp,
        });

        return {
            forecast: cachedWritten.forecast,
            timestamp: cachedWritten.timestamp,
            fromCache: false,
            transitChart,
        };

    } catch (error) {
        console.error('[dailyForecast] Error fetching daily forecast:', error);
        throw error;
    }
};
