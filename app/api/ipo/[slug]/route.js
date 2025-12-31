export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/ipo/[slug]
 * 
 * Get detailed IPO information by slug
 */
export async function GET(request, { params }) {
    try {
        const { slug } = await params;

        const ipo = await prisma.iPO.findUnique({
            where: { slug },
            include: {
                registrar: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        baseUrl: true,
                        isActive: true
                    }
                }
            }
        });

        if (!ipo) {
            return NextResponse.json({
                success: false,
                error: 'IPO not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            ipo
        });
    } catch (error) {
        console.error('Error fetching IPO:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch IPO details'
        }, { status: 500 });
    }
}
