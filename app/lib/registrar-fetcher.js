/**
 * Registrar Fetcher Service
 * 
 * Handles fetching allotment status from official IPO registrars.
 * Supports: KFintech, Link Intime, Bigshare, Skyline, MAS
 * 
 * Privacy: NO personal data is stored. PAN is used only for the API call
 * and immediately discarded after returning results.
 */

import * as cheerio from 'cheerio';

// User agents for rotation (anti-block protection)
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
];

/**
 * Get random user agent for requests
 */
function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Build URL from registrar endpoint pattern and parameters
 */
function buildUrl(endpointPattern, params) {
    let url = endpointPattern;

    Object.keys(params).forEach(key => {
        url = url.replace(`{${key}}`, encodeURIComponent(params[key]));
    });

    return url;
}

/**
 * Parse HTML response based on registrar parsing rules
 */
function parseHtmlResponse(html, parsingRules) {
    try {
        const rules = typeof parsingRules === 'string' ? JSON.parse(parsingRules) : parsingRules;
        const $ = cheerio.load(html);

        const result = {
            status: 'not_found',
            shares: 0,
            applicationNo: null,
            refundAmount: 0,
            message: null
        };

        // Check for "not found" indicators
        if (rules.notFoundSelectors) {
            for (const selector of rules.notFoundSelectors) {
                const element = $(selector);
                if (element.length > 0) {
                    result.status = 'not_found';
                    result.message = element.text().trim() || 'No record found for the provided details';
                    return result;
                }
            }
        }

        // Check for allotment status
        if (rules.statusSelector) {
            const statusElement = $(rules.statusSelector);
            if (statusElement.length > 0) {
                const statusText = statusElement.text().trim().toLowerCase();

                if (statusText.includes('allotted') || statusText.includes('allocated') || statusText.includes('success')) {
                    result.status = 'allotted';
                } else if (statusText.includes('not allotted') || statusText.includes('not allocated')) {
                    result.status = 'not_allotted';
                }
            }
        }

        // Extract shares allotted
        if (rules.sharesSelector) {
            const sharesElement = $(rules.sharesSelector);
            if (sharesElement.length > 0) {
                const sharesText = sharesElement.text().trim();
                const sharesMatch = sharesText.match(/\d+/);
                if (sharesMatch) {
                    result.shares = parseInt(sharesMatch[0], 10);
                    if (result.shares > 0) {
                        result.status = 'allotted';
                    }
                }
            }
        }

        // Extract application number
        if (rules.appNoSelector) {
            const appNoElement = $(rules.appNoSelector);
            if (appNoElement.length > 0) {
                result.applicationNo = appNoElement.text().trim();
            }
        }

        // Extract refund amount
        if (rules.refundSelector) {
            const refundElement = $(rules.refundSelector);
            if (refundElement.length > 0) {
                const refundText = refundElement.text().trim();
                const refundMatch = refundText.match(/[\d,]+\.?\d*/);
                if (refundMatch) {
                    result.refundAmount = parseFloat(refundMatch[0].replace(/,/g, ''));
                }
            }
        }

        return result;
    } catch (error) {
        console.error('Error parsing HTML response:', error);
        throw new Error('Failed to parse registrar response');
    }
}

/**
 * Parse JSON response based on registrar parsing rules
 */
function parseJsonResponse(json, parsingRules) {
    try {
        const rules = typeof parsingRules === 'string' ? JSON.parse(parsingRules) : parsingRules;
        const data = typeof json === 'string' ? JSON.parse(json) : json;

        const result = {
            status: 'not_found',
            shares: 0,
            applicationNo: null,
            refundAmount: 0,
            message: null
        };

        // Extract values using JSON paths
        if (rules.statusPath) {
            const statusValue = getNestedValue(data, rules.statusPath);
            if (statusValue) {
                const statusText = String(statusValue).toLowerCase();
                if (statusText.includes('allotted') || statusText.includes('allocated')) {
                    result.status = 'allotted';
                } else if (statusText.includes('not allotted') || statusText.includes('not allocated')) {
                    result.status = 'not_allotted';
                }
            }
        }

        if (rules.sharesPath) {
            const shares = getNestedValue(data, rules.sharesPath);
            if (shares) {
                result.shares = parseInt(shares, 10);
                if (result.shares > 0) {
                    result.status = 'allotted';
                }
            }
        }

        if (rules.appNoPath) {
            result.applicationNo = getNestedValue(data, rules.appNoPath);
        }

        if (rules.refundPath) {
            const refund = getNestedValue(data, rules.refundPath);
            if (refund) {
                result.refundAmount = parseFloat(refund);
            }
        }

        return result;
    } catch (error) {
        console.error('Error parsing JSON response:', error);
        throw new Error('Failed to parse registrar response');
    }
}

/**
 * Get nested value from object using dot notation path
 */
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Fetch allotment status from registrar
 * 
 * @param {Object} registrar - Registrar configuration
 * @param {Object} params - User parameters (pan, appNo, etc.)
 * @returns {Object} Result with success, status, shares, etc.
 */
export async function fetchAllotmentStatus(registrar, params) {
    try {
        // Build URL from pattern
        const url = buildUrl(registrar.endpointPattern, params);

        // Fetch with timeout and user-agent rotation
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(url, {
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': registrar.responseFormat === 'json'
                    ? 'application/json'
                    : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 404) {
                return {
                    success: false,
                    status: 'not_found',
                    error: 'No allotment data found for the provided details'
                };
            }

            throw new Error(`Registrar returned status ${response.status}`);
        }

        // Parse response based on format
        let result;
        if (registrar.responseFormat === 'json') {
            const json = await response.json();
            result = parseJsonResponse(json, registrar.parsingRules);
        } else {
            const html = await response.text();

            // Check for CAPTCHA
            if (html.toLowerCase().includes('captcha') || html.toLowerCase().includes('recaptcha')) {
                return {
                    success: false,
                    status: 'captcha',
                    error: 'CAPTCHA detected. Please check directly on the registrar website.'
                };
            }

            result = parseHtmlResponse(html, registrar.parsingRules);
        }

        return {
            success: true,
            ...result
        };

    } catch (error) {
        console.error('Error fetching allotment status:', error);

        if (error.name === 'AbortError') {
            return {
                success: false,
                status: 'timeout',
                error: 'Request timed out. The registrar may be experiencing high traffic.'
            };
        }

        return {
            success: false,
            status: 'error',
            error: error.message || 'Failed to fetch allotment status'
        };
    }
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate PAN format (ABCDE1234F)
 */
export function validatePAN(pan) {
    if (!pan) return false;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
}

/**
 * Mask PAN for display (show only last 4 characters)
 */
export function maskPAN(pan) {
    if (!pan || pan.length < 4) return '****';
    return '******' + pan.slice(-4);
}

/**
 * Validate Application Number format (8-12 digits)
 */
export function validateApplicationNumber(appNo) {
    if (!appNo) return false;
    return /^\d{8,12}$/.test(appNo);
}

/**
 * Validate DP ID and Client ID format (8 digits each)
 */
export function validateDPClientID(dpId, clientId) {
    if (!dpId || !clientId) return false;
    const dpIdValid = /^\d{8}$/.test(dpId);
    const clientIdValid = /^\d{8}$/.test(clientId);
    return dpIdValid && clientIdValid;
}
