export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/ipos
 * List all IPOs for admin
 */
export async function GET() {
    try {
        const ipos = await prisma.iPO.findMany({
            include: {
                registrar: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                },
                _count: {
                    select: {
                        allotmentChecks: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            ipos
        });
    } catch (error) {
        console.error('Error fetching IPOs:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch IPOs'
        }, { status: 500 });
    }
}

/**
 * POST /api/admin/ipos
 * Create new IPO
 */
export async function POST(request) {
    try {
        const body = await request.json();

        // Generate slug from name
        const slug = body.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-allotment-status';

        const ipo = await prisma.iPO.create({
            data: {
                name: body.name,
                slug,
                category: body.category || 'Mainboard',
                status: body.status || 'Upcoming',
                issuePrice: body.issuePrice ? parseFloat(body.issuePrice) : null,
                minPrice: body.minPrice ? parseFloat(body.minPrice) : null,
                maxPrice: body.maxPrice ? parseFloat(body.maxPrice) : null,
                lotSize: body.lotSize ? parseInt(body.lotSize) : null,
                openDate: body.openDate ? new Date(body.openDate) : null,
                closeDate: body.closeDate ? new Date(body.closeDate) : null,
                allotmentDate: body.allotmentDate ? new Date(body.allotmentDate) : null,
                listingDate: body.listingDate ? new Date(body.listingDate) : null,
                registrarId: body.registrarId ? parseInt(body.registrarId) : null,
                isAllotmentLive: body.isAllotmentLive || false,
                exchange: body.exchange,
                issueSize: body.issueSize ? parseFloat(body.issueSize) : null,
                about: body.about,
                seoTitle: body.seoTitle || `${body.name} IPO Allotment Status Check`,
                seoDescription: body.seoDescription || `Check ${body.name} IPO allotment status online by PAN, application number using official registrar data.`,
                focusKeyword: body.focusKeyword || `${body.name.toLowerCase()} ipo allotment status`
            }
        });

        return NextResponse.json({
            success: true,
            ipo
        });
    } catch (error) {
        console.error('Error creating IPO:', error);

        if (error.code === 'P2002') {
            return NextResponse.json({
                success: false,
                error: 'An IPO with this name already exists'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: 'Failed to create IPO'
        }, { status: 500 });
    }
}

/**
 * PUT /api/admin/ipos
 * Update existing IPO
 */
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'IPO ID is required'
            }, { status: 400 });
        }

        const updateData = {};

        if (data.name) updateData.name = data.name;
        if (data.category) updateData.category = data.category;
        if (data.status) updateData.status = data.status;
        if (data.issuePrice !== undefined) updateData.issuePrice = data.issuePrice ? parseFloat(data.issuePrice) : null;
        if (data.minPrice !== undefined) updateData.minPrice = data.minPrice ? parseFloat(data.minPrice) : null;
        if (data.maxPrice !== undefined) updateData.maxPrice = data.maxPrice ? parseFloat(data.maxPrice) : null;
        if (data.lotSize !== undefined) updateData.lotSize = data.lotSize ? parseInt(data.lotSize) : null;
        if (data.openDate !== undefined) updateData.openDate = data.openDate ? new Date(data.openDate) : null;
        if (data.closeDate !== undefined) updateData.closeDate = data.closeDate ? new Date(data.closeDate) : null;
        if (data.allotmentDate !== undefined) updateData.allotmentDate = data.allotmentDate ? new Date(data.allotmentDate) : null;
        if (data.listingDate !== undefined) updateData.listingDate = data.listingDate ? new Date(data.listingDate) : null;
        if (data.registrarId !== undefined) updateData.registrarId = data.registrarId ? parseInt(data.registrarId) : null;
        if (data.isAllotmentLive !== undefined) updateData.isAllotmentLive = data.isAllotmentLive;
        if (data.exchange !== undefined) updateData.exchange = data.exchange;
        if (data.issueSize !== undefined) updateData.issueSize = data.issueSize ? parseFloat(data.issueSize) : null;
        if (data.about !== undefined) updateData.about = data.about;
        if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
        if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;

        const ipo = await prisma.iPO.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            ipo
        });
    } catch (error) {
        console.error('Error updating IPO:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update IPO'
        }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/ipos
 * Delete IPO
 */
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'IPO ID is required'
            }, { status: 400 });
        }

        await prisma.iPO.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({
            success: true,
            message: 'IPO deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting IPO:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete IPO'
        }, { status: 500 });
    }
}
