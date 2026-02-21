/**
 * Synthetic load history for training the Load Prediction model.
 * 200 records with realistic hospital load patterns.
 */
export const loadHistory = (() => {
    const records = [];
    for (let i = 0; i < 200; i++) {
        const hour = Math.floor(Math.random() * 24);
        const dayOfWeek = Math.floor(Math.random() * 7);
        const queueLength = Math.floor(Math.random() * 20);

        // Realistic wait time: peaks during 8–14, lower on weekends
        const hourFactor = (hour >= 8 && hour <= 14) ? 1.5 : (hour >= 20 || hour <= 5) ? 0.6 : 1.0;
        const dayFactor = (dayOfWeek >= 1 && dayOfWeek <= 5) ? 1.2 : 0.8;
        const waitTime = Math.round(
            (5 + queueLength * 1.8 + hour * 0.3) * hourFactor * dayFactor + (Math.random() * 10 - 5)
        );

        // ICU occupancy: higher during busy hours
        const icuOccupancy = Math.min(100, Math.max(30,
            Math.round(50 + queueLength * 1.2 + hour * 0.5 + (Math.random() * 15 - 7))
        ));

        records.push({ hour, dayOfWeek, queueLength, waitTime: Math.max(0, waitTime), icuOccupancy });
    }
    return records;
})();
