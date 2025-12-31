export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import {
    getAnalyticsOverview,
    getTopIPOs,
    getRegistrarStats,
    getDailyCheckVolume,
    getErrorBreakdown,
    getSEOScoreOverview
} from '@/lib/analytics';

/**
 * GET /api/admin/analytics
 * Get comprehensive analytics data
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const timeRange = searchParams.get('timeRange') || '7d';
        const type = searchParams.get('type');

        if (type === 'overview') {
            const data = await getAnalyticsOverview(timeRange);
            return NextResponse.json({ success: true, data });
        }

        if (type === 'top-ipos') {
            const data = await getTopIPOs(10);
            return NextResponse.json({ success: true, data });
        }

        if (type === 'registrars') {
            const data = await getRegistrarStats();
            return NextResponse.json({ success: true, data });
        }

        if (type === 'daily-volume') {
            const days = parseInt(searchParams.get('days') || '7');
            const data = await getDailyCheckVolume(days);
            return NextResponse.json({ success: true, data });
        }

        if (type === 'errors') {
            const data = await getErrorBreakdown(timeRange);
            return NextResponse.json({ success: true, data });
        }

        if (type === 'seo') {
            const data = await getSEOScoreOverview();
            return NextResponse.json({ success: true, data });
        }

        // Default: return all data
        const [overview, topIPOs, registrars, dailyVolume, errors, seo] = await Promise.all([
            getAnalyticsOverview(timeRange),
            getTopIPOs(10),
            getRegistrarStats(),
            getDailyCheckVolume(7),
            getErrorBreakdown(timeRange),
            getSEOScoreOverview()
        ]);

        return NextResponse.json({
            success: true,
            data: {
                overview,
                topIPOs,
                registrars,
                dailyVolume,
                errors,
                seo
            }
        });
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch analytics'
        }, { status: 500 });
    }
}
