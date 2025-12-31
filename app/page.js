import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import AllotmentChecker from './components/AllotmentChecker/AllotmentChecker';

export const metadata = {
    title: 'IPO Allotment Status Check | Check by PAN, Application Number Online',
    description: 'Check IPO allotment status instantly using official registrar data. Verify by PAN, Application Number, or DP ID. Free, fast, and secure - no data stored.',
    keywords: 'IPO allotment status, IPO allotment check, check IPO allotment by PAN, IPO allotment status check online, KFintech, Link Intime, Bigshare'
};

export default function HomePage() {
    return (
        <>
            <Header />
            <main>
                {/* Hero Section */}
                <section className="hero">
                    <div className="container">
                        <h1 className="hero-title">IPO Allotment Status Check</h1>
                        <p className="hero-subtitle">
                            Instantly check your IPO allotment status using official registrar data.
                            Free, fast, and completely secure.
                        </p>
                        <div className="trust-badges">
                            <span className="trust-badge">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                                Official Registrar Data
                            </span>
                            <span className="trust-badge">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                                No Data Stored
                            </span>
                            <span className="trust-badge">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                                100% Free
                            </span>
                        </div>
                    </div>
                </section>

                {/* Allotment Checker Tool */}
                <section className="container" style={{ marginTop: '-20px' }}>
                    <AllotmentChecker />
                </section>

                {/* Content Sections */}
                <section className="content-section">
                    <div className="container">
                        <div className="card">
                            <h2 className="section-title">How to Check IPO Allotment Status</h2>
                            <ol className="steps-list">
                                <li>Select the IPO name from the dropdown list above</li>
                                <li>Choose your preferred method: PAN, Application Number, or DP ID + Client ID</li>
                                <li>Enter your details (we don't store any personal information)</li>
                                <li>Click "Check Allotment Status" to get instant results</li>
                            </ol>
                        </div>

                        <div className="card" style={{ marginTop: '24px' }}>
                            <h2 className="section-title">Supported Registrars</h2>
                            <p>We support allotment checking for all major IPO registrars in India:</p>
                            <ul style={{ paddingLeft: '20px', marginTop: '12px' }}>
                                <li style={{ padding: '8px 0', color: '#a0a0a0' }}>KFin Technologies (formerly Karvy Fintech)</li>
                                <li style={{ padding: '8px 0', color: '#a0a0a0' }}>Link Intime India Private Limited</li>
                                <li style={{ padding: '8px 0', color: '#a0a0a0' }}>Bigshare Services Private Limited</li>
                                <li style={{ padding: '8px 0', color: '#a0a0a0' }}>Skyline Financial Services</li>
                                <li style={{ padding: '8px 0', color: '#a0a0a0' }}>MAS Services Limited</li>
                            </ul>
                        </div>

                        <div className="card" style={{ marginTop: '24px' }}>
                            <h2 className="section-title">When is Allotment Finalized?</h2>
                            <p>
                                IPO allotment is typically finalized 3-4 working days after the IPO closes.
                                The registrar publishes the allotment status on their website, which we fetch
                                and display here for your convenience.
                            </p>
                            <p>
                                If an IPO is oversubscribed, shares are allotted through a computerized lottery
                                system as per SEBI guidelines. Not all applicants receive shares in an oversubscribed IPO.
                            </p>
                        </div>

                        <div className="card" style={{ marginTop: '24px' }}>
                            <h2 className="section-title">What If You Are Not Allotted?</h2>
                            <p>
                                If shares are not allotted to you, don't worry! The amount you paid during the
                                application will be refunded to your bank account within 2-3 working days.
                            </p>
                            <p>
                                The refund is processed automatically by the registrar, and you'll receive the
                                full amount you had paid (including any margin money).
                            </p>
                        </div>

                        <div className="card" style={{ marginTop: '24px' }}>
                            <h2 className="section-title">When Will Shares Be Credited?</h2>
                            <p>
                                If you are allotted shares, they will be credited to your Demat account within
                                1-2 working days after the allotment date. You can check your Demat account
                                statement to confirm the credit.
                            </p>
                            <p>
                                The shares will be available for trading on the listing date, which is typically
                                announced along with the allotment date.
                            </p>
                        </div>

                        {/* FAQ Section */}
                        <div className="card" style={{ marginTop: '24px' }}>
                            <h2 className="section-title">Frequently Asked Questions</h2>

                            <div className="faq-item">
                                <h3 className="faq-question">Can I check IPO allotment by PAN?</h3>
                                <p className="faq-answer">
                                    Yes, you can check IPO allotment status using your PAN number. Most registrars
                                    support PAN-based allotment checking.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3 className="faq-question">Is this allotment data official?</h3>
                                <p className="faq-answer">
                                    Yes, all allotment data is fetched directly from the official registrar websites.
                                    We do not modify or predict allotment status.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3 className="faq-question">Why is my IPO allotment not showing?</h3>
                                <p className="faq-answer">
                                    Allotment data may take time to reflect on the registrar's website, or the
                                    registrar site may be temporarily unavailable due to high traffic.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3 className="faq-question">Do you store my PAN or application details?</h3>
                                <p className="faq-answer">
                                    No, we do not store any personal information. All checks are processed in
                                    real-time and your data is not saved on our servers.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3 className="faq-question">What if the registrar website is down?</h3>
                                <p className="faq-answer">
                                    If the registrar website is unavailable, we'll provide you with a direct link
                                    to check the status on their official website once it's back online.
                                </p>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="disclaimer">
                            <h3>⚠️ Disclaimer</h3>
                            <p>
                                Allotment data is fetched from official registrar websites. We do not store or
                                modify user data. This is an informational tool only. For any discrepancies,
                                please refer to the official registrar website.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
