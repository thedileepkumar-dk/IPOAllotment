export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/registrars
 * List all registrars
 */
export async function GET() {
    try {
        const registrars = await prisma.registrar.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: {
                        ipos: true,
                        allotmentChecks: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            registrars
        });
    } catch (error) {
        console.error('Error fetching registrars:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch registrars'
        }, { status: 500 });
    }
}

/**
 * POST /api/admin/registrars
 * Create new registrar
 */
export async function POST(request) {
    try {
        const body = await request.json();

        // Validate JSON fields
        try {
            JSON.parse(body.requiredParams);
            JSON.parse(body.parsingRules);
        } catch (e) {
            return NextResponse.json({
                success: false,
                error: 'requiredParams and parsingRules must be valid JSON'
            }, { status: 400 });
        }

        const registrar = await prisma.registrar.create({
            data: {
                name: body.name,
                slug: body.slug,
                baseUrl: body.baseUrl,
                endpointPattern: body.endpointPattern,
                requiredParams: body.requiredParams,
                responseFormat: body.responseFormat || 'html',
                parsingRules: body.parsingRules,
                isActive: body.isActive !== undefined ? body.isActive : true
            }
        });

        return NextResponse.json({
            success: true,
            registrar
        });
    } catch (error) {
        console.error('Error creating registrar:', error);

        if (error.code === 'P2002') {
            return NextResponse.json({
                success: false,
                error: 'A registrar with this name or slug already exists'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: 'Failed to create registrar'
        }, { status: 500 });
    }
}

/**
 * PUT /api/admin/registrars
 * Update registrar
 */
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Registrar ID is required'
            }, { status: 400 });
        }

        // Validate JSON fields if provided
        if (data.requiredParams) {
            try { JSON.parse(data.requiredParams); } catch (e) {
                return NextResponse.json({ success: false, error: 'Invalid requiredParams JSON' }, { status: 400 });
            }
        }
        if (data.parsingRules) {
            try { JSON.parse(data.parsingRules); } catch (e) {
                return NextResponse.json({ success: false, error: 'Invalid parsingRules JSON' }, { status: 400 });
            }
        }

        const registrar = await prisma.registrar.update({
            where: { id: parseInt(id) },
            data
        });

        return NextResponse.json({
            success: true,
            registrar
        });
    } catch (error) {
        console.error('Error updating registrar:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update registrar'
        }, { status: 500 });
    }
}
