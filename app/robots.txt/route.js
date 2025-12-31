import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Get system setting for robots.txt or use default
        const robotsSetting = await prisma.systemSetting.findUnique({
            where: { key: 'robots_txt_content' }
        });

        const robotsTxt = robotsSetting?.value || `
# IPO Allotment Status Checker - Robots.txt

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/admin/

# Sitemap
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://ipoallotment.in'}/sitemap.xml
`.trim();

        return new Response(robotsTxt, {
            headers: {
                'Content-Type': 'text/plain',
                'Cache-Control': 'public, max-age=86400' // 24 hours
            }
        });
    } catch (error) {
        console.error('Error generating robots.txt:', error);
        return new Response('User-agent: *\nAllow: /', {
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}
