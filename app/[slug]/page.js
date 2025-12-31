import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import AllotmentChecker from '../components/AllotmentChecker/AllotmentChecker';

/**
 * Generate SEO metadata for dynamic pages (IPO or Static Page)
 */
export async function generateMetadata({ params }) {
    const { slug } = await params;

    // Try finding an IPO first
    const ipo = await prisma.iPO.findUnique({
        where: { slug },
        select: {
            name: true,
            seoTitle: true,
            seoDescription: true,
            focusKeyword: true
        }
    });

    if (ipo) {
        return {
            title: ipo.seoTitle || `${ipo.name} IPO Allotment Status Check`,
            description: ipo.seoDescription || `Check ${ipo.name} IPO allotment status online by PAN, application number using official registrar data.`,
            keywords: ipo.focusKeyword || `${ipo.name.toLowerCase()} ipo allotment status, ${ipo.name.toLowerCase()} allotment check`
        };
    }

    // If not an IPO, try finding a static page
    const page = await prisma.page.findUnique({
        where: { slug },
        select: { title: true, seoTitle: true, seoDescription: true }
    });

    if (page) {
        return {
            title: page.seoTitle || page.title,
            description: page.seoDescription
        };
    }

    return {
        title: 'Page Not Found',
        description: 'The requested page was not found.'
    };
}

export const dynamic = 'force-dynamic';

/**
 * Dynamic Page Component (Handles both IPOs and Static Content)
 */
export default async function DynamicPage({ params }) {
    const { slug } = await params;

    // 1. Try fetching IPO data
    const ipo = await prisma.iPO.findUnique({
        where: { slug },
        include: {
            registrar: {
                select: {
                    name: true,
                    baseUrl: true
                }
            }
        }
    });

    if (ipo) {
        return <IPOStatusPage ipo={ipo} />;
    }

    // 2. Try fetching static page data
    const page = await prisma.page.findUnique({
        where: { slug }
    });

    if (page && page.status === 'published') {
        return <StaticContentPage page={page} />;
    }

    // 3. Neither found
    notFound();
}

/**
 * Component for IPO Allotment Status
 */
function IPOStatusPage({ ipo }) {
    // Format dates
    const formatDate = (date) => {
        if (!date) return 'TBA';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const ipoList = [{
        id: ipo.id,
        name: ipo.name,
        slug: ipo.slug,
        category: ipo.category
    }];

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": `How to check ${ipo.name} IPO allotment status?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `You can check ${ipo.name} IPO allotment status by entering your PAN number or application number in the checker tool above. The data is fetched from the official registrar website.`
                }
            },
            {
                "@type": "Question",
                "name": `When will ${ipo.name} IPO allotment be announced?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": ipo.allotmentDate
                        ? `${ipo.name} IPO allotment is expected on ${formatDate(ipo.allotmentDate)}.`
                        : `${ipo.name} IPO allotment date has not been announced yet.`
                }
            },
            {
                "@type": "Question",
                "name": `What is the ${ipo.name} IPO registrar?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": ipo.registrar
                        ? `${ipo.registrar.name} is the official registrar for ${ipo.name} IPO.`
                        : `Registrar information for ${ipo.name} IPO is not yet available.`
                }
            }
        ]
    };

    return (
        <>
            <Header />
            <main>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
                <section className="hero">
                    <div className="container">
                        <h1 className="hero-title">{ipo.name} IPO Allotment Status Check</h1>
                        <p className="hero-subtitle">Check your allotment status using official registrar data</p>
                        <div className="trust-badges">
                            <span className="trust-badge">✓ Official Data from {ipo.registrar?.name || 'Registrar'}</span>
                            <span className="trust-badge">✓ No Data Stored</span>
                        </div>
                    </div>
                </section>
                <section className="container" style={{ marginTop: '-20px' }}>
                    <AllotmentChecker ipoList={ipoList} preselectedIPO={ipo.slug} />
                </section>
                <section className="container" style={{ marginTop: '40px' }}>
                    <div className="card">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div>
                                <p style={{ color: '#666', marginBottom: '4px' }}>Registrar</p>
                                <p style={{ fontWeight: '600', margin: 0 }}>{ipo.registrar?.name || 'TBA'}</p>
                            </div>
                            <div>
                                <p style={{ color: '#666', marginBottom: '4px' }}>Allotment Date</p>
                                <p style={{ fontWeight: '600', margin: 0 }}>{formatDate(ipo.allotmentDate)}</p>
                            </div>
                            <div>
                                <p style={{ color: '#666', marginBottom: '4px' }}>Listing Date</p>
                                <p style={{ fontWeight: '600', margin: 0 }}>{formatDate(ipo.listingDate)}</p>
                            </div>
                            <div>
                                <p style={{ color: '#666', marginBottom: '4px' }}>Category</p>
                                <p style={{ fontWeight: '600', margin: 0 }}>{ipo.category}</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="content-section">
                    <div className="container">
                        <div className="card">
                            <h2 className="section-title">How to Check {ipo.name} IPO Allotment Status</h2>
                            <ol className="steps-list">
                                <li>The IPO is already selected above for your convenience</li>
                                <li>Enter your PAN number (format: ABCDE1234F)</li>
                                <li>Or use Application Number or DP ID + Client ID</li>
                                <li>Click "Check Allotment Status" to see results</li>
                            </ol>
                        </div>
                        {ipo.registrar && (
                            <div className="card" style={{ marginTop: '24px' }}>
                                <h2 className="section-title">{ipo.name} IPO Registrar</h2>
                                <p><strong>{ipo.registrar.name}</strong> is the official registrar for {ipo.name} IPO.</p>
                                <p>All allotment data shown on this page is fetched directly from the registrar's official website.</p>
                            </div>
                        )}
                        <div className="card" style={{ marginTop: '24px' }}>
                            <h2 className="section-title">{ipo.name} IPO Important Dates</h2>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                                        <td style={{ padding: '14px 0', color: '#a0a0a0' }}>IPO Open Date</td>
                                        <td style={{ padding: '14px 0', textAlign: 'right' }}>{formatDate(ipo.openDate)}</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                                        <td style={{ padding: '14px 0', color: '#a0a0a0' }}>IPO Close Date</td>
                                        <td style={{ padding: '14px 0', textAlign: 'right' }}>{formatDate(ipo.closeDate)}</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                                        <td style={{ padding: '14px 0', color: '#a0a0a0' }}>Allotment Date</td>
                                        <td style={{ padding: '14px 0', textAlign: 'right' }}>{formatDate(ipo.allotmentDate)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '14px 0', color: '#a0a0a0' }}>Listing Date</td>
                                        <td style={{ padding: '14px 0', textAlign: 'right' }}>{formatDate(ipo.listingDate)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="card" style={{ marginTop: '24px' }}>
                            <h2 className="section-title">What If You Are Not Allotted {ipo.name} Shares?</h2>
                            <p>If you are not allotted shares in {ipo.name} IPO, your blocked amount will be refunded to your bank account within 2-3 working days after the allotment date.</p>
                        </div>
                        <div className="card" style={{ marginTop: '24px' }}>
                            <h2 className="section-title">{ipo.name} IPO Allotment – FAQs</h2>
                            <div className="faq-item">
                                <h3 className="faq-question">Can I check {ipo.name} allotment by PAN?</h3>
                                <p className="faq-answer">Yes, you can check {ipo.name} IPO allotment status using your PAN number.</p>
                            </div>
                        </div>
                        <div className="disclaimer">
                            <h3>⚠️ Disclaimer</h3>
                            <p>Allotment data for {ipo.name} IPO is fetched from the official registrar website.</p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

/**
 * Component for Static Content Pages
 */
function StaticContentPage({ page }) {
    return (
        <>
            <Header />
            <main>
                <section className="content-section">
                    <div className="container">
                        <div className="card">
                            <h1 style={{ marginBottom: '24px' }}>{page.title}</h1>
                            <div
                                dangerouslySetInnerHTML={{ __html: page.content }}
                                style={{
                                    color: '#a0a0a0',
                                    lineHeight: '1.8'
                                }}
                            />
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
