export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/redirects
 * List all redirects
 */
export async function GET() {
    try {
        const redirects = await prisma.redirect.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            redirects
        });
    } catch (error) {
        console.error('Error fetching redirects:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch redirects'
        }, { status: 500 });
    }
}

/**
 * POST /api/admin/redirects
 * Create new redirect
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { sourceUrl, destinationUrl, statusCode = 301, isActive = true } = body;

        if (!sourceUrl || !destinationUrl) {
            return NextResponse.json({
                success: false,
                error: 'Source URL and destination URL are required'
            }, { status: 400 });
        }

        const redirect = await prisma.redirect.create({
            data: {
                sourceUrl,
                destinationUrl,
                statusCode: parseInt(statusCode),
                isActive
            }
        });

        return NextResponse.json({
            success: true,
            redirect
        });
    } catch (error) {
        console.error('Error creating redirect:', error);

        if (error.code === 'P2002') {
            return NextResponse.json({
                success: false,
                error: 'A redirect for this source URL already exists'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: 'Failed to create redirect'
        }, { status: 500 });
    }
}

/**
 * PUT /api/admin/redirects
 * Update redirect
 */
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Redirect ID is required'
            }, { status: 400 });
        }

        const redirect = await prisma.redirect.update({
            where: { id: parseInt(id) },
            data
        });

        return NextResponse.json({
            success: true,
            redirect
        });
    } catch (error) {
        console.error('Error updating redirect:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update redirect'
        }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/redirects
 * Delete redirect
 */
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Redirect ID is required'
            }, { status: 400 });
        }

        await prisma.redirect.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({
            success: true,
            message: 'Redirect deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting redirect:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete redirect'
        }, { status: 500 });
    }
}
