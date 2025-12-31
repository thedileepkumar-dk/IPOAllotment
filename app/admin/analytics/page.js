'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../dashboard/dashboard.module.css';

export default function AdminAnalytics() {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d');
    const [overview, setOverview] = useState({
        totalChecks: 0,
        periodChecks: 0,
        successRate: 0,
        totalIPOs: 0,
        liveIPOs: 0,
        trend: 0
    });
    const [topIPOs, setTopIPOs] = useState([]);
    const [registrars, setRegistrars] = useState([]);
    const [dailyVolume, setDailyVolume] = useState([]);
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    async function fetchAnalytics() {
        try {
            const [overviewRes, iposRes, regsRes, volumeRes, errorsRes] = await Promise.all([
                fetch(`/api/admin/analytics?type=overview&timeRange=${timeRange}`),
                fetch('/api/admin/analytics?type=top-ipos'),
                fetch('/api/admin/analytics?type=registrars'),
                fetch('/api/admin/analytics?type=daily-volume&days=7'),
                fetch(`/api/admin/analytics?type=errors&timeRange=${timeRange}`)
            ]);

            const [overviewData, iposData, regsData, volumeData, errorsData] = await Promise.all([
                overviewRes.json(),
                iposRes.json(),
                regsRes.json(),
                volumeRes.json(),
                errorsRes.json()
            ]);

            if (overviewData.success) setOverview(overviewData.data);
            if (iposData.success) setTopIPOs(iposData.data);
            if (regsData.success) setRegistrars(regsData.data);
            if (volumeData.success) setDailyVolume(volumeData.data);
            if (errorsData.success) setErrors(errorsData.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className={styles.container}><div className={styles.loading}>Loading...</div></div>;
    }

    const metrics = [
        {
            label: 'Total Checks',
            value: overview.periodChecks.toLocaleString(),
            change: `${overview.trend > 0 ? '+' : ''}${overview.trend}%`,
            icon: '📊',
            color: '#3b82f6'
        },
        {
            label: 'Success Rate',
            value: `${overview.successRate}%`,
            icon: '✅',
            color: '#10b981'
        },
        {
            label: 'Live IPOs',
            value: overview.liveIPOs,
            total: overview.totalIPOs,
            icon: '🔴',
            color: '#ef4444'
        },
        {
            label: 'All Time Checks',
            value: overview.totalChecks.toLocaleString(),
            icon: '📈',
            color: '#f59e0b'
        }
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Analytics Dashboard</h1>
                <nav className={styles.nav}>
                    <Link href="/admin/dashboard" className={styles.navLink}>Dashboard</Link>
                    <Link href="/admin/seo" className={styles.navLink}>SEO</Link>
                    <Link href="/admin/redirects" className={styles.navLink}>Redirects</Link>
                    <Link href="/admin/settings" className={styles.navLink}>Settings</Link>
                </nav>
            </header>

            <main className={styles.main}>
                {/* Time Range Filter */}
                <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a0a0a0' }}>
                        Time Range:
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            style={{ padding: '8px 16px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '6px', color: '#fff' }}
                        >
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="90d">Last 90 Days</option>
                        </select>
                    </label>
                </div>

                {/* Metrics Grid */}
                <div className={styles.statsGrid}>
                    {metrics.map((metric, idx) => (
                        <div key={idx} className={styles.statCard}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                <span style={{ fontSize: '2rem' }}>{metric.icon}</span>
                                {metric.change && (
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        background: metric.change.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: metric.change.startsWith('+') ? '#10b981' : '#ef4444'
                                    }}>
                                        {metric.change}
                                    </span>
                                )}
                            </div>
                            <div className={styles.statLabel}>{metric.label}</div>
                            <div className={styles.statNumber}>
                                {metric.value}
                                {metric.total && <span style={{ fontSize: '1rem', color: '#666' }}> / {metric.total}</span>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Daily Volume Chart */}
                <div style={{ background: '#111', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a2a', marginTop: '24px' }}>
                    <h2 style={{ marginBottom: '20px' }}>Daily Check Volume</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '200px', gap: '8px' }}>
                        {dailyVolume.map((day, idx) => {
                            const maxCount = Math.max(...dailyVolume.map(d => d.count));
                            const heightPercent = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                            return (
                                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{day.count}</div>
                                    <div
                                        style={{
                                            width: '100%',
                                            height: `${heightPercent}%`,
                                            background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
                                            borderRadius: '4px 4px 0 0',
                                            minHeight: '4px'
                                        }}
                                        title={`${day.count} checks`}
                                    />
                                    <div style={{ fontSize: '0.75rem', color: '#a0a0a0' }}>{day.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top IPOs and Registrars Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginTop: '24px' }}>
                    {/* Top IPOs */}
                    <div style={{ background: '#111', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
                        <h3 style={{ marginBottom: '16px' }}>Top IPOs by Checks</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {topIPOs.slice(0, 5).map((ipo, idx) => (
                                <div key={ipo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#1a1a1a', borderRadius: '8px' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{idx + 1}. {ipo.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{ipo.category}</div>
                                    </div>
                                    <div style={{ fontWeight: 700, color: '#3b82f6' }}>{ipo.checks.toLocaleString()}</div>
                                </div>
                            ))}
                            {topIPOs.length === 0 && (
                                <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No data yet</div>
                            )}
                        </div>
                    </div>

                    {/* Registrar Performance */}
                    <div style={{ background: '#111', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
                        <h3 style={{ marginBottom: '16px' }}>Registrar Performance</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {registrars.slice(0, 5).map((reg) => (
                                <div key={reg.id} style={{ padding: '12px', background: '#1a1a1a', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ fontWeight: 600 }}>{reg.name}</div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#666' }}>{reg.successRate}%</span>
                                            {reg.isActive ? (
                                                <span style={{ color: '#10b981' }}>●</span>
                                            ) : (
                                                <span style={{ color: '#666' }}>●</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                        {reg.totalChecks.toLocaleString()} checks • {reg.totalIPOs} IPOs
                                    </div>
                                </div>
                            ))}
                            {registrars.length === 0 && (
                                <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No data yet</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Breakdown */}
                {errors.length > 0 && (
                    <div style={{ background: '#111', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a2a', marginTop: '24px' }}>
                        <h3 style={{ marginBottom: '16px' }}>Error Breakdown</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                            {errors.map((error) => (
                                <div key={error.status} style={{ padding: '16px', background: '#1a1a1a', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{error.count}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#a0a0a0', textTransform: 'capitalize', marginTop: '4px' }}>
                                        {error.status.replace('_', ' ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Analytics Tips */}
                <div style={{ marginTop: '40px', padding: '24px', background: '#1a1a1a', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
                    <h3 style={{ marginBottom: '16px' }}>Analytics Insights</h3>
                    <ul style={{ color: '#a0a0a0', lineHeight: '1.8', paddingLeft: '20px' }}>
                        <li>Monitor success rate to identify registrar issues early</li>
                        <li>Peak check volumes typically occur on allotment dates</li>
                        <li>High error rates may indicate registrar website changes</li>
                        <li>Top IPOs indicate user interest and content opportunities</li>
                        <li>Registrar performance helps prioritize integration improvements</li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
