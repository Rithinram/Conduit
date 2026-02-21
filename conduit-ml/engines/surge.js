/**
 * Surge Detection Engine
 * Rule-based thresholds combined with moving averages
 * to detect when a hospital or network is entering surge conditions.
 */

/**
 * Determine surge level for a hospital or network.
 * @param {number} icuOccupancy - ICU occupancy percentage (0–100)
 * @param {number} erWait - ER wait time in minutes
 * @param {number} admissionRate - Current patients/hour
 * @param {number} movingAvg - 6-hour moving average of admission rate
 * @returns {'CRITICAL'|'WATCH'|'STABLE'} Surge level
 */
export function getSurgeLevel(icuOccupancy, erWait, admissionRate = 0, movingAvg = 0) {
    // Critical: hard thresholds
    if (icuOccupancy > 85 || erWait > 45) return 'CRITICAL';

    // Watch: admission rate spiking above moving average
    if (movingAvg > 0 && admissionRate > movingAvg * 1.5) return 'WATCH';

    // Additional watch: moderately high occupancy + wait combo
    if (icuOccupancy > 70 && erWait > 30) return 'WATCH';

    return 'STABLE';
}

/**
 * Compute a sliding-window moving average.
 * @param {number[]} history - Array of numeric values (e.g. admission rates per hour)
 * @param {number} [window=6] - Window size
 * @returns {number} The moving average of the last `window` entries
 */
export function computeMovingAverage(history, window = 6) {
    if (!history || history.length === 0) return 0;
    const recent = history.slice(-window);
    return recent.reduce((sum, val) => sum + val, 0) / recent.length;
}

/**
 * Get surge color for UI rendering.
 * @param {'CRITICAL'|'WATCH'|'STABLE'} level
 * @returns {string} CSS color variable
 */
export function getSurgeColor(level) {
    switch (level) {
        case 'CRITICAL': return 'var(--danger)';
        case 'WATCH': return 'var(--warning)';
        case 'STABLE': return 'var(--success)';
        default: return 'var(--secondary)';
    }
}

/**
 * Get surge background color for badges.
 * @param {'CRITICAL'|'WATCH'|'STABLE'} level
 * @returns {string} CSS background color variable
 */
export function getSurgeBadgeClass(level) {
    switch (level) {
        case 'CRITICAL': return 'badge-danger';
        case 'WATCH': return 'badge-warning';
        case 'STABLE': return 'badge-success';
        default: return '';
    }
}
