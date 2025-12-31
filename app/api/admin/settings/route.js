export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/settings
 * Get all settings or specific by key
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');
        const category = searchParams.get('category');

        if (key) {
            const setting = await prisma.systemSetting.findUnique({
                where: { key }
            });

            return NextResponse.json({
                success: true,
                setting
            });
        }

        const where = category ? { category } : {};
        const settings = await prisma.systemSetting.findMany({
            where,
            orderBy: { category: 'asc' }
        });

        return NextResponse.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch settings'
        }, { status: 500 });
    }
}

/**
 * POST /api/admin/settings
 * Create or update setting
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { key, value, category = 'general', description, type = 'text' } = body;

        if (!key || value === undefined) {
            return NextResponse.json({
                success: false,
                error: 'Key and value are required'
            }, { status: 400 });
        }

        const setting = await prisma.systemSetting.upsert({
            where: { key },
            update: { value, category, description, type },
            create: { key, value, category, description, type }
        });

        return NextResponse.json({
            success: true,
            setting
        });
    } catch (error) {
        console.error('Error saving setting:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to save setting'
        }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/settings
 * Delete setting
 */
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        if (!key) {
            return NextResponse.json({
                success: false,
                error: 'Setting key is required'
            }, { status: 400 });
        }

        await prisma.systemSetting.delete({
            where: { key }
        });

        return NextResponse.json({
            success: true,
            message: 'Setting deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting setting:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete setting'
        }, { status: 500 });
    }
}
