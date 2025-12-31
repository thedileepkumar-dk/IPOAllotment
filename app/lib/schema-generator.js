/**
 * JSON-LD Schema Generator for IPO Pages
 * Generates Google-compliant structured data
 */

export function generateIPOSchema(ipo, siteUrl = 'https://ipoallotment.in') {
    const base = {
        '@context': 'https://schema.org',
    };

    // IPO as Financial Product
    const ipoSchema = {
        ...base,
        '@type': 'FinancialProduct',
        'name': `${ipo.name} IPO`,
        'description': ipo.seoDescription || `Check ${ipo.name} IPO allotment status online`,
        'url': `${siteUrl}/${ipo.slug}`,
        'provider': {
            '@type': 'Organization',
            'name': ipo.registrar?.name || 'IPO Registrar',
        }
    };

    return ipoSchema;
}

export function generateFAQSchema(faqs = []) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqs.map(faq => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer
            }
        }))
    };
}

export function generateHowToSchema(ipo) {
    return {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        'name': `How to Check ${ipo.name} IPO Allotment Status`,
        'description': `Step-by-step guide to check ${ipo.name} IPO allotment status online`,
        'step': [
            {
                '@type': 'HowToStep',
                'name': 'Select IPO',
                'text': `Select ${ipo.name} from the dropdown list`,
                'position': 1
            },
            {
                '@type': 'HowToStep',
                'name': 'Choose Method',
                'text': 'Choose PAN, Application Number, or DP ID + Client ID',
                'position': 2
            },
            {
                '@type': 'HowToStep',
                'name': 'Enter Details',
                'text': 'Enter your identification details',
                'position': 3
            },
            {
                '@type': 'HowToStep',
                'name': 'Check Status',
                'text': 'Click Check Allotment Status to see results',
                'position': 4
            }
        ]
    };
}

export function generateWebsiteSchema(siteUrl = 'https://ipoallotment.in') {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'IPO Allotment Status Checker',
        'url': siteUrl,
        'description': 'Check IPO allotment status instantly using official registrar data',
        'potentialAction': {
            '@type': 'SearchAction',
            'target': {
                '@type': 'EntryPoint',
                'urlTemplate': `${siteUrl}/?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
        }
    };
}

export function generateOrganizationSchema(siteUrl = 'https://ipoallotment.in') {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'IPO Allotment',
        'url': siteUrl,
        'logo': `${siteUrl}/logo.png`,
        'description': 'Fast, free, and secure IPO allotment status checker for Indian IPOs',
        'sameAs': []
    };
}

export function generateBreadcrumbSchema(breadcrumbs = []) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': item.name,
            'item': item.url
        }))
    };
}

/**
 * Inject schema into JSX (for Server Components)
 */
export function injectSchema(schema) {
    if (!schema) return null;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
