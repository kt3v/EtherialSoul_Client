const { Origin, Horoscope } = require('circular-natal-horoscope-js/dist/index.js');

export const calculateCelestialBodies = (birthDateTime, latitude, longitude) => {
    try {
        const date = new Date(birthDateTime);
        
        const origin = new Origin({
            year: date.getUTCFullYear(),
            month: date.getUTCMonth(),
            date: date.getUTCDate(),
            hour: date.getUTCHours(),
            minute: date.getUTCMinutes(),
            latitude: latitude,
            longitude: longitude
        });

        const horoscope = new Horoscope({
            origin: origin,
            houseSystem: "placidus",
            zodiac: "tropical",
            aspectPoints: ['bodies', 'points', 'angles'],
            aspectWithPoints: ['bodies', 'points', 'angles'],
            aspectTypes: ["major", "minor"],
            customOrbs: {},
            language: 'en'
        });

        const celestialBodies = horoscope.CelestialBodies.all;
        const cusps = horoscope.Ascendant;

        const formattedData = {};
        
        celestialBodies.forEach(body => {
            const key = body.label.toLowerCase().replace(/\s+/g, '');
            formattedData[key] = {
                sign: body.Sign.label,
                degree: body.ChartPosition.Ecliptic.DecimalDegrees,
                arcDegrees: {
                    degrees: body.ChartPosition.Ecliptic.ArcDegrees.degrees,
                    minutes: body.ChartPosition.Ecliptic.ArcDegrees.minutes,
                    seconds: body.ChartPosition.Ecliptic.ArcDegrees.seconds
                },
                house: body.House ? body.House.id : null,
                isRetrograde: body.isRetrograde || false
            };
        });

        if (cusps) {
            formattedData.ascendant = {
                sign: cusps.Sign.label,
                degree: cusps.ChartPosition.Ecliptic.DecimalDegrees,
                arcDegrees: {
                    degrees: cusps.ChartPosition.Ecliptic.ArcDegrees.degrees,
                    minutes: cusps.ChartPosition.Ecliptic.ArcDegrees.minutes,
                    seconds: cusps.ChartPosition.Ecliptic.ArcDegrees.seconds
                },
                house: 1
            };
        }

        const midheaven = horoscope.CelestialPoints.all.find(point => point.label === 'Midheaven');
        if (midheaven) {
            formattedData.midheaven = {
                sign: midheaven.Sign.label,
                degree: midheaven.ChartPosition.Ecliptic.DecimalDegrees,
                arcDegrees: {
                    degrees: midheaven.ChartPosition.Ecliptic.ArcDegrees.degrees,
                    minutes: midheaven.ChartPosition.Ecliptic.ArcDegrees.minutes,
                    seconds: midheaven.ChartPosition.Ecliptic.ArcDegrees.seconds
                },
                house: 10
            };
        }

        console.log('[astrology] calculated celestial bodies:', formattedData);
        return formattedData;
    } catch (error) {
        console.error('[astrology] calculation error:', error);
        throw new Error(`Failed to calculate astrology data: ${error.message}`);
    }
};
