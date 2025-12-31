export default function NotFound() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0a',
            color: '#fff',
            textAlign: 'center',
            padding: '20px'
        }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '16px', color: '#3b82f6' }}>404</h1>
            <h2 style={{ marginBottom: '16px' }}>Page Not Found</h2>
            <p style={{ color: '#666', marginBottom: '32px' }}>
                The page you're looking for doesn't exist or has been moved.
            </p>
            <a
                href="/"
                style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: '#fff',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '500'
                }}
            >
                Go to Homepage
            </a>
        </div>
    );
}
