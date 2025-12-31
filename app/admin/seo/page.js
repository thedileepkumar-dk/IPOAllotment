'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../dashboard/dashboard.module.css';

export default function AdminSEO() {
    const [ipos, setIpos] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        averageScore: 0,
        needsWork: 0,
        noIndex: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const res = await fetch('/api/admin/ipos');
            const data = await res.json();

            if (data.success) {
                const items = data.ipos || [];

                setIpos(items);
                setStats({
                    total: items.length,
                    averageScore: Math.round(
                        items.reduce((acc, curr) => acc + (curr.seoScore || 0), 0) / items.length
                    ) || 0,
                    needsWork: items.filter(i => (i.seoScore || 0) < 60).length,
                    noIndex: items.filter(i => !i.isIndexable).length
                });
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className={styles.container}><div className={styles.loading}>Loading...</div></div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>SEO Suite</h1>
                <nav className={styles.nav}>
                    <Link href="/admin/dashboard" className={styles.navLink}>Dashboard</Link>
                    <Link href="/admin/redirects" className={styles.navLink}>Redirects</Link>
                    <Link href="/admin/settings" className={styles.navLink}>Settings</Link>
                </nav>
            </header>

            <main className={styles.main}>
                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Average SEO Score</span>
                        <span className={styles.statNumber} style={{ color: stats.averageScore > 70 ? '#10b981' : '#f59e0b' }}>
                            {stats.averageScore}%
                        </span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Critical (Score &lt; 60)</span>
                        <span className={styles.statNumber} style={{ color: '#ef4444' }}>
                            {stats.needsWork}
                        </span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>De-indexed Pages</span>
                        <span className={styles.statNumber}>
                            {stats.noIndex}
                        </span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Total IPOs</span>
                        <span className={styles.statNumber}>
                            {stats.total}
                        </span>
                    </div>
                </div>

                {/* Quick Links */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <Link
                        href="/sitemap.xml"
                        target="_blank"
                        style={{ padding: '10px 20px', background: '#333', borderRadius: '8px', color: '#fff', textDecoration: 'none' }}
                    >
                        View Sitemap
                    </Link>
                    <Link
                        href="/robots.txt"
                        target="_blank"
                        style={{ padding: '10px 20px', background: '#333', borderRadius: '8px', color: '#fff', textDecoration: 'none' }}
                    >
                        View Robots.txt
                    </Link>
                </div>

                {/* IPO SEO Table */}
                <div className={styles.table}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #334155' }}>
                        <h3>Content SEO Performance</h3>
                    </div>
                    <div className={styles.tableHeader}>
                        <span>IPO Name</span>
                        <span>Slug</span>
                        <span>SEO Score</span>
                        <span>Status</span>
                        <span>Actions</span>
                    </div>
                    {ipos.map((ipo) => (
                        <div key={ipo.id} className={styles.tableRow}>
                            <span style={{ fontWeight: 600 }}>{ipo.name}</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#666' }}>
                                /{ipo.slug}
                            </span>
                            <span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '40px', height: '4px', background: '#334155', borderRadius: '2px' }}>
                                        <div
                                            style={{
                                                width: `${ipo.seoScore || 0}%`,
                                                height: '100%',
                                                background: (ipo.seoScore || 0) > 70 ? '#10b981' : (ipo.seoScore || 0) > 40 ? '#f59e0b' : '#ef4444',
                                                borderRadius: '2px'
                                            }}
                                        />
                                    </div>
                                    <span style={{ fontWeight: 700 }}>{ipo.seoScore || 0}</span>
                                </div>
                            </span>
                            <span>
                                {ipo.isIndexable ? (
                                    <span style={{ color: '#10b981' }}>✓ Indexed</span>
                                ) : (
                                    <span style={{ color: '#666' }}>⚠ No-Index</span>
                                )}
                            </span>
                            <span>
                                <a
                                    href={`/${ipo.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.85rem' }}
                                >
                                    View Page →
                                </a>
                            </span>
                        </div>
                    ))}
                    {ipos.length === 0 && (
                        <div className={styles.empty}>No IPOs yet. Add your first IPO!</div>
                    )}
                </div>

                {/* SEO Tips */}
                <div style={{ marginTop: '40px', padding: '24px', background: '#1a1a1a', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
                    <h3 style={{ marginBottom: '16px' }}>SEO Optimization Tips</h3>
                    <ul style={{ color: '#a0a0a0', lineHeight: '1.8', paddingLeft: '20px' }}>
                        <li>Keep SEO titles between 50-65 characters for optimal display</li>
                        <li>Include focus keyword in title, description, and first paragraph</li>
                        <li>Use H2/H3 headings to structure content</li>
                        <li>Add internal and external links to increase authority</li>
                        <li>Optimize images with descriptive alt text</li>
                        <li>Maintain keyword density between 0.5% - 2.5%</li>
                        <li>Use robots meta tags to control indexing</li>
                        <li>Submit sitemap to Google Search Console</li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
