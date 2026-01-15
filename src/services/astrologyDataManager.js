import { calculateCelestialBodies } from './astrologyService';
import { DateTime } from 'luxon';

class AstrologyDataManager {
    constructor() {
        this.natalChart = null;
        this.transitChart = null;
    }

    setNatalChart(astrologyData) {
        this.natalChart = astrologyData;
        console.log('[AstrologyDataManager] Natal chart set:', this.natalChart);
    }

    setTransitChart(astrologyData) {
        this.transitChart = astrologyData;
        console.log('[AstrologyDataManager] Transit chart set:', this.transitChart);
    }

    getNatalChart() {
        return this.natalChart;
    }

    getTransitChart() {
        return this.transitChart;
    }

    generateTransitChart(birthPlace, birthLatitude, birthLongitude, timezone) {
        try {
            const now = DateTime.now().setZone(timezone || 'UTC');
            
            console.log('[AstrologyDataManager] Generating transit chart for:', {
                now: now.toISO(),
                latitude: birthLatitude,
                longitude: birthLongitude,
                timezone: timezone
            });

            const transitData = calculateCelestialBodies(
                now.toISO(),
                birthLatitude,
                birthLongitude
            );

            this.setTransitChart(transitData);
            return transitData;
        } catch (error) {
            console.error('[AstrologyDataManager] Error generating transit chart:', error);
            throw error;
        }
    }

    clear() {
        this.natalChart = null;
        this.transitChart = null;
        console.log('[AstrologyDataManager] Data cleared');
    }
}

export default new AstrologyDataManager();
