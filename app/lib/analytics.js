/**
 * Analytics Service for IPOAllotment.in
 * Provides insights on IPO performance, allotment checks, and traffic
 */

import { prisma } from './prisma';

/**
 * Get enhanced analytics overview
 */
export async function getAnalyticsOverview(timeRange = '7d') {
    try {
        const startDate = getStartDate(timeRange);
        const now = new Date();

        // Total allotment checks
        const totalChecks = await prisma.allotmentCheck.count();
        const periodChecks = await prisma.allotmentCheck.count({
            where: { checkedAt: { gte: startDate } }
        });

        // Success rate
        const successfulChecks = await prisma.allotmentCheck.count({
            where: {
                checkedAt: { gte: startDate },
                status: 'success'
            }
        });
        const successRate = periodChecks > 0
            ? Math.round((successfulChecks / periodChecks) * 100)
            : 0;

        // IPO stats
        const totalIPOs = await prisma.iPO.count();
        const liveIPOs = await prisma.iPO.count({ where: { isAllotmentLive: true } });

        // Calculate trend
        const previousPeriod = getPreviousPeriod(startDate, now);
        const previousChecks = await prisma.allotmentCheck.count({
            where: {
                checkedAt: {
                    gte: previousPeriod.start,
                    lt: previousPeriod.end
                }
            }
        });
        const trend = previousChecks > 0
            ? Math.round(((periodChecks - previousChecks) / previousChecks) * 100)
            : 0;

        return {
            totalChecks,
            periodChecks,
            successRate,
            totalIPOs,
            liveIPOs,
            trend
        };
    } catch (error) {
        console.error('Analytics overview error:', error);
        return {
            totalChecks: 0,
            periodChecks: 0,
            successRate: 0,
            totalIPOs: 0,
            liveIPOs: 0,
            trend: 0
        };
    }
}

/**
 * Get top performing IPOs by check count
 */
export async function getTopIPOs(limit = 10) {
    try {
        const ipos = await prisma.iPO.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                category: true,
                _count: {
                    select: {
                        allotmentChecks: true
                    }
                }
            },
            orderBy: {
                allotmentChecks: {
                    _count: 'desc'
                }
            },
            take: limit
        });

        return ipos.map(ipo => ({
            id: ipo.id,
            name: ipo.name,
            slug: ipo.slug,
            category: ipo.category,
            checks: ipo._count.allotmentChecks
        }));
    } catch (error) {
        console.error('Top IPOs error:', error);
        return [];
    }
}

/**
 * Get registrar performance stats
 */
export async function getRegistrarStats() {
    try {
        const registrars = await prisma.registrar.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                isActive: true,
                _count: {
                    select: {
                        allotmentChecks: true,
                        ipos: true
                    }
                }
            }
        });

        const stats = await Promise.all(
            registrars.map(async (reg) => {
                const successCount = await prisma.allotmentCheck.count({
                    where: {
                        registrarId: reg.id,
                        status: 'success'
                    }
                });

                return {
                    id: reg.id,
                    name: reg.name,
                    slug: reg.slug,
                    isActive: reg.isActive,
                    totalChecks: reg._count.allotmentChecks,
                    totalIPOs: reg._count.ipos,
                    successRate: reg._count.allotmentChecks > 0
                        ? Math.round((successCount / reg._count.allotmentChecks) * 100)
                        : 0
                };
            })
        );

        return stats.sort((a, b) => b.totalChecks - a.totalChecks);
    } catch (error) {
        console.error('Registrar stats error:', error);
        return [];
    }
}

/**
 * Get daily check volume for charting
 */
export async function getDailyCheckVolume(days = 7) {
    try {
        const data = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const count = await prisma.allotmentCheck.count({
                where: {
                    checkedAt: {
                        gte: date,
                        lt: nextDate
                    }
                }
            });

            data.push({
                date: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                count
            });
        }

        return data;
    } catch (error) {
        console.error('Daily volume error:', error);
        return [];
    }
}

/**
 * Get error breakdown
 */
export async function getErrorBreakdown(timeRange = '7d') {
    try {
        const startDate = getStartDate(timeRange);

        const errors = await prisma.allotmentCheck.groupBy({
            by: ['status'],
            where: {
                checkedAt: { gte: startDate },
                status: { not: 'success' }
            },
            _count: {
                status: true
            }
        });

        return errors.map(e => ({
            status: e.status,
            count: e._count.status
        }));
    } catch (error) {
        console.error('Error breakdown error:', error);
        return [];
    }
}

/**
 * Get SEO score overview for IPOs
 */
export async function getSEOScoreOverview() {
    try {
        const ipos = await prisma.iPO.findMany({
            select: { seoScore: true }
        });

        const scores = ipos.map(ipo => ipo.seoScore || 0);
        const excellent = scores.filter(s => s >= 80).length;
        const good = scores.filter(s => s >= 60 && s < 80).length;
        const needsWork = scores.filter(s => s < 60).length;
        const average = scores.length > 0
            ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
            : 0;

        return {
            average,
            excellent,
            good,
            needsWork,
            total: ipos.length
        };
    } catch (error) {
        console.error('SEO overview error:', error);
        return { average: 0, excellent: 0, good: 0, needsWork: 0, total: 0 };
    }
}

// Helper functions

function getStartDate(timeRange) {
    const now = new Date();
    switch (timeRange) {
        case '24h':
            return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        case '7d':
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case '30d':
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case '90d':
            return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        default:
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
}

function getPreviousPeriod(startDate, endDate) {
    const duration = endDate.getTime() - startDate.getTime();
    return {
        start: new Date(startDate.getTime() - duration),
        end: startDate
    };
}
