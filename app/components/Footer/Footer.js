import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-links">
                    <Link href="/about">About Us</Link>
                    <Link href="/privacy-policy">Privacy Policy</Link>
                    <Link href="/disclaimer">Disclaimer</Link>
                </div>
                <p className="footer-text">
                    © {new Date().getFullYear()} IPO Allotment. All data from official registrar sources.
                </p>
                <p className="footer-text" style={{ marginTop: '8px', fontSize: '0.75rem' }}>
                    We do not store any personal data. All checks are processed in real-time.
                </p>
            </div>
        </footer>
    );
}
