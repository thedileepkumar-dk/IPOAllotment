import Link from 'next/link';

export default function Header() {
    return (
        <header className="header">
            <div className="container header-content">
                <Link href="/" className="logo">
                    IPO<span>Allotment</span>
                </Link>
                <nav className="nav-links">
                    <Link href="/" className="nav-link">Home</Link>
                    <Link href="/about" className="nav-link">About</Link>
                    <Link href="/privacy-policy" className="nav-link">Privacy</Link>
                </nav>
            </div>
        </header>
    );
}
