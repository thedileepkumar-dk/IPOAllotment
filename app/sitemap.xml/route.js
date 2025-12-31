import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ipoallotment.in';

        // Get all IPOs
        const ipos = await prisma.iPO.findMany({
            where: {
                isIndexable: true
            },
            select: {
                slug: true,
                updatedAt: true
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        // Get all pages
        const pages = await prisma.page.findMany({
            where: {
                isIndexable: true,
                status: 'published'
            },
            select: {
                slug: true,
                updatedAt: true
            }
        });

        // Generate XML sitemap
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- IPO Pages -->
  ${ipos.map(ipo => `
  <url>
    <loc>${siteUrl}/${ipo.slug}</loc>
    <lastmod>${new Date(ipo.updatedAt).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('')}
  
  <!-- Static Pages -->
  ${pages.map(page => `
  <url>
    <loc>${siteUrl}/${page.slug}</loc>
    <lastmod>${new Date(page.updatedAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`;

        return new Response(sitemap.trim(), {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600' // 1 hour
            }
        });
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
            status: 500,
            headers: { 'Content-Type': 'application/xml' }
        });
    }
}
