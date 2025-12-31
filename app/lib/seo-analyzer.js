/**
 * SEO Analyzer for IPO Content
 * Adapted from Hamraahi_CMS SEO Plugin
 * 
 * Evaluates content quality across 3 categories:
 * - Basic SEO (40 pts): Title,  description, URL, content intro
 * - Additional SEO (30 pts): Headings, images, keyword density
 * - Readability (30 pts): Title length, links, paragraph structure
 */

export function analyzeSEO(content = '', meta = {}) {
    const {
        title = '',
        description = '',
        focusKeyword = '',
        slug = '',
        headers = [], // Array of H2/H3 text
        images = [],  // Array of { src, alt }
        links = { internal: 0, external: 0 }
    } = meta;

    const results = {
        score: 0,
        categories: {
            basic: { score: 0, total: 40, checks: [] },
            additional: { score: 0, total: 30, checks: [] },
            readability: { score: 0, total: 30, checks: [] }
        }
    };

    if (!focusKeyword) {
        return {
            score: 0,
            error: 'Please set a focus keyword to start analysis.'
        };
    }

    const keywordLower = focusKeyword.toLowerCase();
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();
    const contentLower = content.toLowerCase();

    // ========================================================================
    // Category 1: Basic SEO (40 Points)
    // ========================================================================
    const basic = results.categories.basic;

    // 1. Keyword in Title (10 pts)
    const kwInTitle = titleLower.includes(keywordLower);
    basic.checks.push({
        label: 'Focus Keyword in SEO Title',
        passed: kwInTitle,
        points: 10,
        message: kwInTitle
            ? 'Great! Keyword found in title.'
            : 'Add your focus keyword to the SEO title.'
    });
    if (kwInTitle) basic.score += 10;

    // 2. Keyword in Meta Description (10 pts)
    const kwInDesc = descLower.includes(keywordLower);
    basic.checks.push({
        label: 'Focus Keyword in Meta Description',
        passed: kwInDesc,
        points: 10,
        message: kwInDesc
            ? 'Good meta description!'
            : 'Include your focus keyword in the meta description.'
    });
    if (kwInDesc) basic.score += 10;

    // 3. Keyword in URL (10 pts)
    const kwInSlug = slug.toLowerCase().includes(keywordLower.replace(/\s+/g, '-'));
    basic.checks.push({
        label: 'Focus Keyword in URL',
        passed: kwInSlug,
        points: 10,
        message: kwInSlug
            ? 'URL is keyword optimized.'
            : 'Add the focus keyword to your URL slug.'
    });
    if (kwInSlug) basic.score += 10;

    // 4. Keyword in Introduction (10 pts)
    const first10Percent = contentLower.substring(0, Math.floor(content.length * 0.1));
    const kwInIntro = first10Percent.includes(keywordLower);
    basic.checks.push({
        label: 'Focus Keyword in Introduction',
        passed: kwInIntro,
        points: 10,
        message: kwInIntro
            ? 'Keyword appears early in the content.'
            : 'Try using your keyword in the first 10% of the content.'
    });
    if (kwInIntro) basic.score += 10;

    // ========================================================================
    // Category 2: Additional SEO (30 Points)
    // ========================================================================
    const additional = results.categories.additional;

    // 5. Keyword in Subheadings (10 pts)
    const kwInHeaders = headers.some(h => h.toLowerCase().includes(keywordLower));
    additional.checks.push({
        label: 'Focus Keyword in Subheadings',
        passed: kwInHeaders,
        points: 10,
        message: kwInHeaders
            ? 'Keyword found in H2/H3 tags.'
            : 'Use your focus keyword in H2 or H3 subheadings.'
    });
    if (kwInHeaders) additional.score += 10;

    // 6. Image Alt Attributes (10 pts)
    const missingAlt = images.length > 0 && images.some(img => !img.alt || img.alt.trim() === '');
    additional.checks.push({
        label: 'Image Alt Attributes',
        passed: !missingAlt && images.length > 0,
        points: 10,
        message: images.length === 0
            ? 'No images found.'
            : (missingAlt ? 'Some images are missing alt text.' : 'All images have alt text.')
    });
    if (!missingAlt && images.length > 0) additional.score += 10;

    // 7. Keyword Density (10 pts)
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const kwCount = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;
    const density = wordCount > 0 ? (kwCount / wordCount) * 100 : 0;
    const densityOk = density >= 0.5 && density <= 2.5;
    additional.checks.push({
        label: 'Keyword Density',
        passed: densityOk,
        points: 10,
        message: `Density is ${density.toFixed(2)}%. Aim for 0.5% - 2.5%.`
    });
    if (densityOk) additional.score += 10;

    // ========================================================================
    // Category 3: Readability & Trust (30 Points)
    // ========================================================================
    const readability = results.categories.readability;

    // 8. Title Length (10 pts)
    const titleLenOk = title.length >= 50 && title.length <= 65;
    readability.checks.push({
        label: 'SEO Title Length',
        passed: titleLenOk,
        points: 10,
        message: titleLenOk
            ? 'Perfect length.'
            : `Title should be between 50-65 chars. Current: ${title.length}`
    });
    if (titleLenOk) readability.score += 10;

    // 9. Link Diversity (10 pts)
    const hasLinks = links.internal > 0 && links.external > 0;
    readability.checks.push({
        label: 'Link Diversity',
        passed: hasLinks,
        points: 10,
        message: `Links: ${links.internal} internal, ${links.external} external.`
    });
    if (hasLinks) readability.score += 10;

    // 10. Paragraph Readability (10 pts)
    const longParagraphs = content.match(/<p>[^<]{400,}<\/p>/g);
    readability.checks.push({
        label: 'Paragraph Readability',
        passed: !longParagraphs,
        points: 10,
        message: longParagraphs
            ? 'Some paragraphs are too long (400+ chars). Break them up.'
            : 'Paragraph length is good.'
    });
    if (!longParagraphs) readability.score += 10;

    // Calculate Final Score
    results.score = basic.score + additional.score + readability.score;

    return results;
}

/**
 * Extract headers from HTML content
 */
export function extractHeaders(html) {
    const headers = [];
    const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
    const h3Regex = /<h3[^>]*>(.*?)<\/h3>/gi;

    let match;
    while ((match = h2Regex.exec(html)) !== null) {
        headers.push(match[1].replace(/<[^>]*>/g, '').trim());
    }
    while ((match = h3Regex.exec(html)) !== null) {
        headers.push(match[1].replace(/<[^>]*>/g, '').trim());
    }

    return headers;
}

/**
 * Extract images from HTML content
 */
export function extractImages(html) {
    const images = [];
    const imgRegex = /<img[^>]+>/gi;

    let match;
    while ((match = imgRegex.exec(html)) !== null) {
        const srcMatch = /src=["']([^"']*)["']/i.exec(match[0]);
        const altMatch = /alt=["']([^"']*)["']/i.exec(match[0]);

        images.push({
            src: srcMatch ? srcMatch[1] : '',
            alt: altMatch ? altMatch[1] : ''
        });
    }

    return images;
}

/**
 * Count internal and external links in HTML
 */
export function extractLinks(html, currentDomain) {
    const links = { internal: 0, external: 0 };
    const linkRegex = /<a[^>]+href=["']([^"']*)["'][^>]*>/gi;

    let match;
    while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];

        if (href.startsWith('/') || href.includes(currentDomain)) {
            links.internal++;
        } else if (href.startsWith('http')) {
            links.external++;
        }
    }

    return links;
}
