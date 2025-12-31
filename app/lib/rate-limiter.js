/**
 * Rate Limiter Utility
 * 
 * In-memory rate limiting for API endpoints.
 * Default: 10 requests per minute per IP.
 */

const rateLimitCache = new Map();

// Configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

/**
 * Check if a request is within rate limits
 * 
 * @param {string} identifier - Unique identifier (usually IP address)
 * @returns {Object} { allowed: boolean, remaining: number, resetIn: number }
 */
export function checkRateLimit(identifier) {
    const now = Date.now();
    const entry = rateLimitCache.get(identifier) || { requests: [], firstRequest: now };

    // Remove old requests outside the window
    entry.requests = entry.requests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

    // Check if allowed
    if (entry.requests.length >= RATE_LIMIT_MAX_REQUESTS) {
        const oldestRequest = entry.requests[0];
        const resetIn = RATE_LIMIT_WINDOW - (now - oldestRequest);

        return {
            allowed: false,
            remaining: 0,
            resetIn: Math.ceil(resetIn / 1000)
        };
    }

    // Add current request
    entry.requests.push(now);
    rateLimitCache.set(identifier, entry);

    return {
        allowed: true,
        remaining: RATE_LIMIT_MAX_REQUESTS - entry.requests.length,
        resetIn: 0
    };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request) {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Clean up old entries periodically
 */
export function cleanupRateLimits() {
    const now = Date.now();

    for (const [key, entry] of rateLimitCache.entries()) {
        entry.requests = entry.requests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

        if (entry.requests.length === 0) {
            rateLimitCache.delete(key);
        }
    }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
