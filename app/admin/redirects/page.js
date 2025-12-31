'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../dashboard/dashboard.module.css';

export default function AdminRedirects() {
    const [redirects, setRedirects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        sourceUrl: '',
        destinationUrl: '',
        statusCode: 301,
        isActive: true
    });

    useEffect(() => {
        fetchRedirects();
    }, []);

    async function fetchRedirects() {
        try {
            const res = await fetch('/api/admin/redirects');
            const data = await res.json();
            if (data.success) {
                setRedirects(data.redirects || []);
            }
        } catch (err) {
            console.error('Error fetching redirects:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const url = editing ? '/api/admin/redirects' : '/api/admin/redirects';
            const method = editing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editing ? { id: editing, ...form } : form)
            });

            const data = await res.json();

            if (data.success) {
                await fetchRedirects();
                resetForm();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error('Error saving redirect:', err);
            alert('Failed to save redirect');
        }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this redirect?')) return;

        try {
            const res = await fetch(`/api/admin/redirects?id=${id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (data.success) {
                await fetchRedirects();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error('Error deleting redirect:', err);
            alert('Failed to delete redirect');
        }
    }

    function resetForm() {
        setForm({ sourceUrl: '', destinationUrl: '', statusCode: 301, isActive: true });
        setEditing(null);
    }

    function startEdit(redirect) {
        setForm({
            sourceUrl: redirect.sourceUrl,
            destinationUrl: redirect.destinationUrl,
            statusCode: redirect.statusCode,
            isActive: redirect.isActive
        });
        setEditing(redirect.id);
    }

    if (loading) {
        return <div className={styles.container}><div className={styles.loading}>Loading...</div></div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Redirect Manager</h1>
                <nav className={styles.nav}>
                    <Link href="/admin/dashboard" className={styles.navLink}>Dashboard</Link>
                    <Link href="/admin/seo" className={styles.navLink}>SEO</Link>
                    <Link href="/admin/settings" className={styles.navLink}>Settings</Link>
                </nav>
            </header>

            <main className={styles.main}>
                {/* Add/Edit redirect Form */}
                <div style={{ background: '#111', padding: '24px', borderRadius: '12px', border: '1px solid #2a2a2a', marginBottom: '24px' }}>
                    <h2 style={{ marginBottom: '20px' }}>{editing ? 'Edit' : 'Add'} Redirect</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>Source URL</label>
                            <input
                                type="text"
                                value={form.sourceUrl}
                                onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                                placeholder="/old-page"
                                required
                                style={{ width: '100%', padding: '12px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>Destination URL</label>
                            <input
                                type="text"
                                value={form.destinationUrl}
                                onChange={(e) => setForm({ ...form, destinationUrl: e.target.value })}
                                placeholder="/new-page or https://example.com"
                                required
                                style={{ width: '100%', padding: '12px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>Status Code</label>
                                <select
                                    value={form.statusCode}
                                    onChange={(e) => setForm({ ...form, statusCode: parseInt(e.target.value) })}
                                    style={{ width: '100%', padding: '12px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                >
                                    <option value={301}>301 - Permanent</option>
                                    <option value={302}>302 - Temporary</option>
                                    <option value={307}>307 - Temporary (Preserve Method)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>Status</label>
                                <select
                                    value={form.isActive ? 'active' : 'inactive'}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })}
                                    style={{ width: '100%', padding: '12px', background: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                type="submit"
                                style={{ padding: '12px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                {editing ? 'Update' : 'Add'} Redirect
                            </button>
                            {editing && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{ padding: '12px 24px', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Redirects Table */}
                <div className={styles.table}>
                    <div className={styles.tableHeader}>
                        <span>Source</span>
                        <span>Destination</span>
                        <span>Code</span>
                        <span>Hits</span>
                        <span>Status</span>
                        <span>Actions</span>
                    </div>
                    {redirects.map((redirect) => (
                        <div key={redirect.id} className={styles.tableRow}>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{redirect.sourceUrl}</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#3b82f6' }}>{redirect.destinationUrl}</span>
                            <span>{redirect.statusCode}</span>
                            <span>{redirect.hits}</span>
                            <span>
                                {redirect.isActive ? (
                                    <span style={{ color: '#10b981' }}>●  Active</span>
                                ) : (
                                    <span style={{ color: '#666' }}>● Inactive</span>
                                )}
                            </span>
                            <span style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => startEdit(redirect)} style={{ padding: '6px 12px', background: '#333', borderRadius: '6px', border: 'none', color: '#fff', cursor: 'pointer' }}>
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(redirect.id)} style={{ padding: '6px 12px', background: '#ef4444', borderRadius: '6px', border: 'none', color: '#fff', cursor: 'pointer' }}>
                                    Delete
                                </button>
                            </span>
                        </div>
                    ))}
                    {redirects.length === 0 && (
                        <div className={styles.empty}>No redirects configured yet.</div>
                    )}
                </div>
            </main>
        </div>
    );
}
