'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalIPOs: 0,
        liveAllotments: 0,
        totalChecks: 0,
        registrars: 0
    });
    const [recentIPOs, setRecentIPOs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            // Fetch IPOs
            const ipoRes = await fetch('/api/admin/ipos');
            const ipoData = await ipoRes.json();

            // Fetch registrars
            const regRes = await fetch('/api/admin/registrars');
            const regData = await regRes.json();

            if (ipoData.success) {
                const ipos = ipoData.ipos || [];
                const liveCount = ipos.filter(ipo => ipo.isAllotmentLive).length;
                const totalChecks = ipos.reduce((sum, ipo) => sum + (ipo._count?.allotmentChecks || 0), 0);

                setStats({
                    totalIPOs: ipos.length,
                    liveAllotments: liveCount,
                    totalChecks,
                    registrars: regData.registrars?.length || 0
                });

                setRecentIPOs(ipos.slice(0, 5));
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Admin Dashboard</h1>
                <nav className={styles.nav}>
                    <Link href="/admin/ipos" className={styles.navLink}>IPOs</Link>
                    <Link href="/admin/registrars" className={styles.navLink}>Registrars</Link>
                    <Link href="/" className={styles.navLink}>View Site</Link>
                </nav>
            </header>

            <main className={styles.main}>
                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>{stats.totalIPOs}</span>
                        <span className={styles.statLabel}>Total IPOs</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>{stats.liveAllotments}</span>
                        <span className={styles.statLabel}>Live Allotments</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>{stats.totalChecks}</span>
                        <span className={styles.statLabel}>Total Checks</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>{stats.registrars}</span>
                        <span className={styles.statLabel}>Registrars</span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className={styles.section}>
                    <h2>Quick Actions</h2>
                    <div className={styles.actions}>
                        <Link href="/admin/ipos/new" className={styles.actionBtn}>
                            + Add New IPO
                        </Link>
                        <Link href="/admin/registrars" className={styles.actionBtn}>
                            Configure Registrars
                        </Link>
                    </div>
                </div>

                {/* Recent IPOs */}
                <div className={styles.section}>
                    <h2>Recent IPOs</h2>
                    <div className={styles.table}>
                        <div className={styles.tableHeader}>
                            <span>Name</span>
                            <span>Category</span>
                            <span>Status</span>
                            <span>Allotment</span>
                        </div>
                        {recentIPOs.map(ipo => (
                            <div key={ipo.id} className={styles.tableRow}>
                                <span>{ipo.name}</span>
                                <span>{ipo.category}</span>
                                <span className={styles.status}>{ipo.status}</span>
                                <span className={ipo.isAllotmentLive ? styles.live : styles.notLive}>
                                    {ipo.isAllotmentLive ? '🟢 Live' : '⚪ Not Live'}
                                </span>
                            </div>
                        ))}
                        {recentIPOs.length === 0 && (
                            <div className={styles.empty}>No IPOs yet. Add your first IPO!</div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
