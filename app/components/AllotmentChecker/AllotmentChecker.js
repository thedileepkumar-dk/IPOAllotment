'use client';

import { useState, useEffect } from 'react';
import styles from './AllotmentChecker.module.css';

export default function AllotmentChecker({ ipoList = [], preselectedIPO = null }) {
    const [selectedIPO, setSelectedIPO] = useState(preselectedIPO || '');
    const [checkMethod, setCheckMethod] = useState('pan');
    const [pan, setPan] = useState('');
    const [appNo, setAppNo] = useState('');
    const [dpId, setDpId] = useState('');
    const [clientId, setClientId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // Fetch IPO list if not provided
    const [ipos, setIpos] = useState(ipoList);

    useEffect(() => {
        if (ipoList.length === 0) {
            fetchIPOs();
        }
    }, [ipoList]);

    async function fetchIPOs() {
        try {
            const response = await fetch('/api/ipo/live');
            if (response.ok) {
                const data = await response.json();
                setIpos(data.ipos || []);
            }
        } catch (err) {
            console.error('Error fetching IPOs:', err);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const body = { ipoSlug: selectedIPO };

            if (checkMethod === 'pan') {
                body.pan = pan.toUpperCase();
            } else if (checkMethod === 'appNo') {
                body.appNo = appNo;
            } else if (checkMethod === 'dpId') {
                body.dpId = dpId;
                body.clientId = clientId;
            }

            const response = await fetch('/api/allotment/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.success) {
                setResult(data);
            } else {
                setError(data.error || 'Failed to check allotment status');
                if (data.fallbackUrl) {
                    setError(prev => `${prev}. You can check directly at: ${data.fallbackUrl}`);
                }
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setResult(null);
        setError(null);
    }

    return (
        <div className={styles.checker}>
            <div className={styles.checkerHeader}>
                <h2 className={styles.checkerTitle}>🔍 Check Your IPO Allotment Status</h2>
                <p className={styles.checkerSubtitle}>
                    Get instant results from official registrar data
                </p>
            </div>

            {!result ? (
                <form onSubmit={handleSubmit} className={styles.checkerForm}>
                    {/* IPO Selection */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Select IPO</label>
                        <select
                            value={selectedIPO}
                            onChange={(e) => setSelectedIPO(e.target.value)}
                            className={styles.select}
                            required
                        >
                            <option value="">-- Select an IPO --</option>
                            {ipos.map((ipo) => (
                                <option key={ipo.slug} value={ipo.slug}>
                                    {ipo.name} ({ipo.category})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Check Method */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Check by</label>
                        <div className={styles.methodSelector}>
                            <button
                                type="button"
                                className={`${styles.methodBtn} ${checkMethod === 'pan' ? styles.active : ''}`}
                                onClick={() => setCheckMethod('pan')}
                            >
                                PAN
                            </button>
                            <button
                                type="button"
                                className={`${styles.methodBtn} ${checkMethod === 'appNo' ? styles.active : ''}`}
                                onClick={() => setCheckMethod('appNo')}
                            >
                                Application No
                            </button>
                            <button
                                type="button"
                                className={`${styles.methodBtn} ${checkMethod === 'dpId' ? styles.active : ''}`}
                                onClick={() => setCheckMethod('dpId')}
                            >
                                DP ID
                            </button>
                        </div>
                    </div>

                    {/* Input Fields */}
                    {checkMethod === 'pan' && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>PAN Number</label>
                            <input
                                type="text"
                                value={pan}
                                onChange={(e) => setPan(e.target.value.toUpperCase())}
                                placeholder="ABCDE1234F"
                                maxLength={10}
                                className={styles.input}
                                required
                            />
                            <span className={styles.hint}>Format: 5 letters + 4 numbers + 1 letter</span>
                        </div>
                    )}

                    {checkMethod === 'appNo' && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Application Number</label>
                            <input
                                type="text"
                                value={appNo}
                                onChange={(e) => setAppNo(e.target.value.replace(/\D/g, ''))}
                                placeholder="Enter 8-12 digit application number"
                                maxLength={12}
                                className={styles.input}
                                required
                            />
                        </div>
                    )}

                    {checkMethod === 'dpId' && (
                        <>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>DP ID</label>
                                <input
                                    type="text"
                                    value={dpId}
                                    onChange={(e) => setDpId(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Enter 8 digit DP ID"
                                    maxLength={8}
                                    className={styles.input}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Client ID</label>
                                <input
                                    type="text"
                                    value={clientId}
                                    onChange={(e) => setClientId(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Enter 8 digit Client ID"
                                    maxLength={8}
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className={styles.errorBox}>
                            <span className={styles.errorIcon}>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !selectedIPO}
                        className={styles.submitBtn}
                    >
                        {loading ? (
                            <>
                                <span className={styles.spinner}></span>
                                Checking...
                            </>
                        ) : (
                            'Check Allotment Status'
                        )}
                    </button>

                    {/* Privacy Notice */}
                    <div className={styles.privacyNotice}>
                        <span className={styles.lockIcon}>🔒</span>
                        <span>We do not store your PAN or personal data</span>
                    </div>
                </form>
            ) : (
                <div className={styles.resultContainer}>
                    <ResultDisplay result={result} onReset={resetForm} />
                </div>
            )}
        </div>
    );
}

function ResultDisplay({ result, onReset }) {
    const isAllotted = result.status === 'allotted';

    return (
        <div className={styles.result}>
            <div className={`${styles.resultHeader} ${isAllotted ? styles.success : styles.notAllotted}`}>
                <span className={styles.resultIcon}>
                    {isAllotted ? '✅' : '❌'}
                </span>
                <span className={styles.resultStatus}>
                    {isAllotted ? 'SHARES ALLOTTED' : 'NOT ALLOTTED'}
                </span>
            </div>

            <div className={styles.resultBody}>
                {isAllotted && result.data?.shares > 0 && (
                    <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>Shares Allotted</span>
                        <span className={styles.resultValue}>{result.data.shares}</span>
                    </div>
                )}

                {result.data?.applicationNo && (
                    <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>Application Number</span>
                        <span className={styles.resultValue}>{result.data.applicationNo}</span>
                    </div>
                )}

                {result.maskedPAN && (
                    <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>PAN</span>
                        <span className={styles.resultValue}>{result.maskedPAN}</span>
                    </div>
                )}

                <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>IPO</span>
                    <span className={styles.resultValue}>{result.ipo?.name}</span>
                </div>

                <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Registrar</span>
                    <span className={styles.resultValue}>{result.registrar}</span>
                </div>

                <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Checked at</span>
                    <span className={styles.resultValue}>
                        {new Date(result.timestamp).toLocaleString('en-IN')}
                    </span>
                </div>
            </div>

            <div className={styles.resultFooter}>
                <button onClick={onReset} className={styles.checkAnotherBtn}>
                    Check Another IPO
                </button>
            </div>

            {!isAllotted && (
                <div className={styles.refundInfo}>
                    <h4>💰 Refund Information</h4>
                    <p>
                        Your blocked amount will be released to your bank account within
                        2-3 working days after the allotment date.
                    </p>
                </div>
            )}
        </div>
    );
}
