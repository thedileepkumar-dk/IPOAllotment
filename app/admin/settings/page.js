'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../dashboard/dashboard.module.css';

export default function AdminSettings() {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        key: '',
        value: '',
        category: 'general',
        description: '',
        type: 'text'
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (data.success) {
                setSettings(data.settings || []);
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (data.success) {
                await fetchSettings();
                setForm({
                    key: '',
                    value: '',
                    category: 'general',
                    description: '',
                    type: 'text'
                });
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error('Error saving setting:', err);
            alert('Failed to save setting');
        }
    }

    if (loading) {
        return <div className={styles.container}><div className={styles.loading}>Loading...</div></div>;
    }

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
        if (!acc[setting.category]) {
            acc[setting.category] = [];
        }
        acc[setting.category].push(setting);
        return acc;
    }, {});

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>System Settings</h1>
                <nav className={styles.nav}>
                    <Link href="/admin/dashboard" className={styles.navLink}>Dashboard</Link>
                    <Link href="/admin/seo" className={styles.navLink}>SEO</Link>
                    <Link href="/admin/redirects" className={styles.navLink}>Redirects</Link>
                </nav>
            </header>

            <main className={styles.main}>
                {/* Add Setting Form */}
                <div style={{ background: '#111', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a2a', marginBottom: '24px' }}>
                    <h2 style={{ marginBottom: '20px' }}>Add/Update Setting</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>Key</label>
                                <input
                                    type="text"
                                    value={form.key}
                                    onChange={(e) => setForm({ ...form, key: e.target.value })}
                                    placeholder="setting_key"
                                    required
                                    style={{ width: '100%', padding: '12px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>Category</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    style={{ width: '100%', padding: '12px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                >
                                    <option value="general">General</option>
                                    <option value="seo">SEO</option>
                                    <option value="analytics">Analytics</option>
                                    <option value="security">Security</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>Value</label>
                            <textarea
                                value={form.value}
                                onChange={(e) => setForm({ ...form, value: e.target.value })}
                                placeholder="Setting value"
                                required
                                rows={4}
                                style={{ width: '100%', padding: '12px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontFamily: 'inherit' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>Description (Optional)</label>
                            <input
                                type="text"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="What this setting controls"
                                style={{ width: '100%', padding: '12px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                            />
                        </div>
                        <button
                            type="submit"
                            style={{ padding: '12px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            Save Setting
                        </button>
                    </form>
                </div>

                {/* Settings List by Category */}
                {Object.entries(groupedSettings).map(([category, categorySettings]) => (
                    <div key={category} style={{ marginBottom: '32px' }}>
                        <h2 style={{ textTransform: 'capitalize', marginBottom: '16px', color: '#3b82f6' }}>
                            {category} Settings
                        </h2>
                        <div className={styles.table}>
                            <div className={styles.tableHeader}>
                                <span>Key</span>
                                <span>Value</span>
                                <span>Description</span>
                            </div>
                            {categorySettings.map((setting) => (
                                <div key={setting.id} className={styles.tableRow}>
                                    <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{setting.key}</span>
                                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {setting.value.substring(0, 50)}{setting.value.length > 50 ? '...' : ''}
                                    </span>
                                    <span style={{ color: '#999', fontSize: '0.85rem' }}>
                                        {setting.description || '-'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {settings.length === 0 && (
                    <div className={styles.empty}>No settings configured yet.</div>
                )}

                {/* Common Settings Examples */}
                <div style={{ marginTop: '40px', padding: '24px', background: '#1a1a1a', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
                    <h3 style={{ marginBottom: '16px' }}>Common Settings</h3>
                    <table style={{ width: '100%', color: '#a0a0a0' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                                <th style={{ textAlign: 'left', padding: '12px' }}>Key</th>
                                <th style={{ textAlign: 'left', padding: '12px' }}>Category</th>
                                <th style={{ textAlign: 'left', padding: '12px' }}>Purpose</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                                <td style={{ padding: '12px', fontFamily: 'monospace' }}>robots_txt_content</td>
                                <td style={{ padding: '12px' }}>SEO</td>
                                <td style={{ padding: '12px' }}>Custom robots.txt content</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                                <td style={{ padding: '12px', fontFamily: 'monospace' }}>google_analytics_id</td>
                                <td style={{ padding: '12px' }}>Analytics</td>
                                <td style={{ padding: '12px' }}>Google Analytics tracking ID</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                                <td style={{ padding: '12px', fontFamily: 'monospace' }}>google_search_console_code</td>
                                <td style={{ padding: '12px' }}>SEO</td>
                                <td style={{ padding: '12px' }}>Webmaster verification code</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '12px', fontFamily: 'monospace' }}>site_name</td>
                                <td style={{ padding: '12px' }}>General</td>
                                <td style={{ padding: '12px' }}>Site name for metadata</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
