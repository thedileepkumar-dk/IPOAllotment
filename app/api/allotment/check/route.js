export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    fetchAllotmentStatus,
    validatePAN,
    validateApplicationNumber,
    validateDPClientID,
    maskPAN
} from '@/lib/registrar-fetcher';
import { checkRateLimit, getClientIP } from '@/lib/rate-limiter';

/**
 * POST /api/allotment/check
 * 
 * Check IPO allotment status from official registrar
 * 
 * Privacy: NO personal data (PAN, AppNo) is stored.
 * Only logs: IPO ID, registrar ID, success/error status
 */
export async function POST(request) {
    try {
        // Get client IP for rate limiting
        const ip = getClientIP(request);

        // Check rate limit
        const rateLimit = checkRateLimit(ip);
        if (!rateLimit.allowed) {
            return NextResponse.json({
                success: false,
                error: `Rate limit exceeded. Please try again in ${rateLimit.resetIn} seconds.`
            }, {
                status: 429,
                headers: {
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(rateLimit.resetIn)
                }
            });
        }

        // Parse request body
        const body = await request.json();
        const { ipoSlug, pan, appNo, dpId, clientId } = body;

        // ========================================================================
        // VALIDATION
        // ========================================================================

        // IPO slug is required
        if (!ipoSlug) {
            return NextResponse.json({
                success: false,
                error: 'Please select an IPO'
            }, { status: 400 });
        }

        // At least one identifier is required
        if (!pan && !appNo && !(dpId && clientId)) {
            return NextResponse.json({
                success: false,
                error: 'Please provide PAN, Application Number, or DP ID + Client ID'
            }, { status: 400 });
        }

        // Validate PAN format
        if (pan && !validatePAN(pan)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid PAN format. PAN should be in format: ABCDE1234F'
            }, { status: 400 });
        }

        // Validate Application Number format
        if (appNo && !validateApplicationNumber(appNo)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid Application Number. It should be 8-12 digits.'
            }, { status: 400 });
        }

        // Validate DP ID and Client ID
        if ((dpId || clientId) && !validateDPClientID(dpId, clientId)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid DP ID or Client ID. Both should be 8 digits.'
            }, { status: 400 });
        }

        // ========================================================================
        // FETCH IPO & REGISTRAR
        // ========================================================================

        const ipo = await prisma.iPO.findUnique({
            where: { slug: ipoSlug },
            include: { registrar: true }
        });

        if (!ipo) {
            return NextResponse.json({
                success: false,
                error: 'IPO not found'
            }, { status: 404 });
        }

        // Check if allotment is live
        if (!ipo.isAllotmentLive) {
            const message = ipo.allotmentDate
                ? `Allotment is expected on ${new Date(ipo.allotmentDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })}`
                : 'Allotment date has not been announced yet';

            return NextResponse.json({
                success: false,
                error: 'Allotment status is not yet available for this IPO',
                message
            }, { status: 400 });
        }

        // Check if registrar is configured
        if (!ipo.registrar) {
            return NextResponse.json({
                success: false,
                error: 'Registrar information is not available for this IPO',
                fallbackUrl: ipo.allotmentUrl || null
            }, { status: 400 });
        }

        // Check if registrar is active
        if (!ipo.registrar.isActive) {
            return NextResponse.json({
                success: false,
                error: 'Registrar is currently unavailable. Please try again later.',
                fallbackUrl: ipo.allotmentUrl || ipo.registrar.baseUrl
            }, { status: 503 });
        }

        // ========================================================================
        // BUILD REQUEST PARAMS
        // ========================================================================

        const requiredParams = JSON.parse(ipo.registrar.requiredParams);
        const params = {
            company: ipo.slug // IPO identifier for registrar
        };

        if (requiredParams.includes('pan') && pan) {
            params.pan = pan.toUpperCase();
        }
        if (requiredParams.includes('appNo') && appNo) {
            params.appNo = appNo;
        }
        if (requiredParams.includes('dpId') && dpId) {
            params.dpId = dpId;
        }
        if (requiredParams.includes('clientId') && clientId) {
            params.clientId = clientId;
        }

        // ========================================================================
        // FETCH FROM REGISTRAR
        // ========================================================================

        const result = await fetchAllotmentStatus(ipo.registrar, params);

        // ========================================================================
        // LOG THE CHECK (NO PERSONAL DATA!)
        // ========================================================================

        await prisma.allotmentCheck.create({
            data: {
                ipoId: ipo.id,
                registrarId: ipo.registrar.id,
                status: result.success ? result.status : 'error',
                errorType: result.success ? null : result.status
            }
        });

        // ========================================================================
        // RETURN RESULT
        // ========================================================================

        if (result.success) {
            return NextResponse.json({
                success: true,
                status: result.status,
                data: {
                    shares: result.shares,
                    applicationNo: result.applicationNo,
                    refundAmount: result.refundAmount,
                    message: result.message
                },
                ipo: {
                    name: ipo.name,
                    slug: ipo.slug
                },
                registrar: ipo.registrar.name,
                timestamp: new Date().toISOString(),
                maskedPAN: pan ? maskPAN(pan) : null
            }, {
                headers: {
                    'X-RateLimit-Remaining': String(rateLimit.remaining)
                }
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.error,
                status: result.status,
                registrar: ipo.registrar.name,
                fallbackUrl: ipo.allotmentUrl || ipo.registrar.baseUrl
            }, {
                status: result.status === 'captcha' ? 503 : 500,
                headers: {
                    'X-RateLimit-Remaining': String(rateLimit.remaining)
                }
            });
        }

    } catch (error) {
        console.error('Error checking allotment status:', error);
        return NextResponse.json({
            success: false,
            error: 'An unexpected error occurred. Please try again later.'
        }, { status: 500 });
    }
}
