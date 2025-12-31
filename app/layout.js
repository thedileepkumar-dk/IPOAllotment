import './globals.css';

export const metadata = {
    title: {
        default: 'IPO Allotment Status Check | Check by PAN, Application Number',
        template: '%s | IPO Allotment'
    },
    description: 'Check IPO allotment status instantly using official registrar data. Verify by PAN, Application Number, or DP ID. Free, fast, and secure - no data stored.',
    keywords: ['IPO allotment status', 'IPO allotment check', 'check IPO allotment by PAN', 'IPO allotment status check online'],
    authors: [{ name: 'IPO Allotment' }],
    creator: 'IPO Allotment',
    publisher: 'IPO Allotment',
    robots: {
        index: true,
        follow: true
    },
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: 'https://ipoallotment.in',
        siteName: 'IPO Allotment',
        title: 'IPO Allotment Status Check | Check by PAN',
        description: 'Check IPO allotment status instantly using official registrar data. Free, fast, and secure.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'IPO Allotment Status Check',
        description: 'Check IPO allotment status instantly using official registrar data.'
    }
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            <body>
                {children}
            </body>
        </html>
    );
}
