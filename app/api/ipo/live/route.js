export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/ipo/live
 * 
 * Get list of IPOs with allotment currently live
 */
export async function GET() {
    try {
        const ipos = await prisma.iPO.findMany({
            where: {
                isAllotmentLive: true
            },
            select: {
                id: true,
                name: true,
                slug: true,
                category: true,
                allotmentDate: true,
                listingDate: true,
                registrar: {
                    select: {
                        name: true,
                        slug: true
                    }
                }
            },
            orderBy: {
                allotmentDate: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            ipos
        });
    } catch (error) {
        console.error('Error fetching live IPOs:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch IPOs'
        }, { status: 500 });
    }
}
