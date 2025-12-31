import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // ============================================================================
    // REGISTRARS
    // ============================================================================

    const registrars = [
        {
            name: 'KFin Technologies',
            slug: 'kfintech',
            baseUrl: 'https://kosmic.kfintech.com',
            endpointPattern: 'https://kosmic.kfintech.com/ipostatus/?company={company}&pan={pan}',
            requiredParams: JSON.stringify(['pan']),
            responseFormat: 'html',
            parsingRules: JSON.stringify({
                statusSelector: '.allotment-status, td:contains("Allotted")',
                sharesSelector: 'td:contains("Shares") + td',
                notFoundSelectors: ['.no-record', ':contains("No record found")'],
                appNoSelector: 'td:contains("Application") + td'
            }),
            isActive: true
        },
        {
            name: 'Link Intime India',
            slug: 'linkintime',
            baseUrl: 'https://linkintime.co.in',
            endpointPattern: 'https://linkintime.co.in/MIPO/Ipoallotment.html?company={company}&pan={pan}',
            requiredParams: JSON.stringify(['pan']),
            responseFormat: 'html',
            parsingRules: JSON.stringify({
                statusSelector: '#allotmentStatus',
                sharesSelector: '#sharesAllotted',
                notFoundSelectors: ['#noRecord', ':contains("not found")'],
                appNoSelector: '#applicationNo'
            }),
            isActive: true
        },
        {
            name: 'Bigshare Services',
            slug: 'bigshare',
            baseUrl: 'https://ipo.bigshareonline.com',
            endpointPattern: 'https://ipo.bigshareonline.com/IPO_STATUS/IPO_allotment.asp?company={company}&pan={pan}',
            requiredParams: JSON.stringify(['pan']),
            responseFormat: 'html',
            parsingRules: JSON.stringify({
                statusSelector: 'table tr:contains("Status") td:last',
                sharesSelector: 'table tr:contains("Shares") td:last',
                notFoundSelectors: [':contains("No Record")'],
                appNoSelector: 'table tr:contains("Application") td:last'
            }),
            isActive: true
        },
        {
            name: 'Skyline Financial',
            slug: 'skyline',
            baseUrl: 'https://www.skylinerta.com',
            endpointPattern: 'https://rti.skylinerta.com/rti_query.php?mode=ipo&company={company}&pan={pan}',
            requiredParams: JSON.stringify(['pan']),
            responseFormat: 'html',
            parsingRules: JSON.stringify({
                statusSelector: '.allotment-result',
                sharesSelector: '.shares-allotted',
                notFoundSelectors: ['.no-data'],
                appNoSelector: '.app-number'
            }),
            isActive: true
        },
        {
            name: 'MAS Services',
            slug: 'mas',
            baseUrl: 'https://www.masserv.com',
            endpointPattern: 'https://www.masserv.com/IPO/IPOAllotment.aspx?company={company}&pan={pan}',
            requiredParams: JSON.stringify(['pan']),
            responseFormat: 'html',
            parsingRules: JSON.stringify({
                statusSelector: '#lblStatus',
                sharesSelector: '#lblShares',
                notFoundSelectors: ['#lblNoRecord'],
                appNoSelector: '#lblAppNo'
            }),
            isActive: true
        }
    ];

    for (const registrar of registrars) {
        await prisma.registrar.upsert({
            where: { slug: registrar.slug },
            update: registrar,
            create: registrar
        });
        console.log(`✅ Registrar: ${registrar.name}`);
    }

    // ============================================================================
    // ADMIN USER
    // ============================================================================

    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.admin.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: adminPassword
        }
    });
    console.log('✅ Admin user created (username: admin, password: admin123)');

    // ============================================================================
    // SAMPLE IPO (for testing)
    // ============================================================================

    const kfintech = await prisma.registrar.findUnique({ where: { slug: 'kfintech' } });

    await prisma.iPO.upsert({
        where: { slug: 'test-ipo-allotment-status' },
        update: {},
        create: {
            name: 'Test IPO Ltd',
            slug: 'test-ipo-allotment-status',
            category: 'Mainboard',
            status: 'Closed',
            issuePrice: 150,
            minPrice: 140,
            maxPrice: 150,
            lotSize: 100,
            openDate: new Date('2025-01-15'),
            closeDate: new Date('2025-01-17'),
            allotmentDate: new Date('2025-01-20'),
            listingDate: new Date('2025-01-22'),
            registrarId: kfintech?.id,
            isAllotmentLive: true,
            seoTitle: 'Test IPO Allotment Status Check',
            seoDescription: 'Check Test IPO allotment status online by PAN, application number using official registrar data.',
            focusKeyword: 'test ipo allotment status',
            exchange: 'NSE',
            issueSize: 500,
            about: 'This is a test IPO for development purposes.'
        }
    });
    console.log('✅ Sample IPO created for testing');

    // ============================================================================
    // STATIC PAGES
    // ============================================================================

    const pages = [
        {
            title: 'About Us',
            slug: 'about',
            content: `<h2>About IPO Allotment</h2>
<p>IPO Allotment is India's trusted platform for checking IPO allotment status. We provide instant, accurate allotment information by fetching data directly from official registrar websites.</p>
<h3>Our Mission</h3>
<p>To make IPO allotment checking simple, fast, and transparent for every Indian investor.</p>
<h3>How It Works</h3>
<p>When you enter your PAN or application number, we securely fetch the allotment status from the official registrar. Your personal information is never stored on our servers.</p>`,
            seoTitle: 'About Us - IPO Allotment Status Checker',
            seoDescription: 'Learn about IPO Allotment, India\'s trusted platform for checking IPO allotment status using official registrar data.'
        },
        {
            title: 'Privacy Policy',
            slug: 'privacy-policy',
            content: `<h2>Privacy Policy</h2>
<h3>Data We Don't Collect</h3>
<p>We do NOT store:</p>
<ul>
<li>PAN numbers</li>
<li>Application numbers</li>
<li>DP IDs or Client IDs</li>
<li>Any personal financial information</li>
</ul>
<h3>How Your Data is Used</h3>
<p>When you check allotment status, your details are sent directly to the official registrar and discarded immediately after displaying the result.</p>
<h3>Logging</h3>
<p>We only log anonymous metrics like IPO name, success/failure status, and timestamp for improving our service. No personal identifiers are stored.</p>`,
            seoTitle: 'Privacy Policy - IPO Allotment',
            seoDescription: 'Read our privacy policy. IPO Allotment does not store your PAN or personal data. Your privacy is our priority.'
        },
        {
            title: 'Disclaimer',
            slug: 'disclaimer',
            content: `<h2>Disclaimer</h2>
<p>The allotment data displayed on this website is fetched from official registrar websites. We do not modify, predict, or store allotment information.</p>
<h3>Not Financial Advice</h3>
<p>Information on this website is for informational purposes only and should not be considered as financial advice. Please consult with a qualified financial advisor before making investment decisions.</p>
<h3>Accuracy</h3>
<p>While we strive for accuracy, we cannot guarantee that the information is always current or error-free. In case of any discrepancy, please refer to the official registrar website.</p>`,
            seoTitle: 'Disclaimer - IPO Allotment',
            seoDescription: 'Read our disclaimer. IPO Allotment fetches data from official registrars. Not financial advice.'
        }
    ];

    for (const page of pages) {
        await prisma.page.upsert({
            where: { slug: page.slug },
            update: page,
            create: page
        });
        console.log(`✅ Page: ${page.title}`);
    }

    // ============================================================================
    // SYSTEM SETTINGS
    // ============================================================================

    const settings = [
        { key: 'site_name', value: 'IPO Allotment', category: 'general' },
        { key: 'site_tagline', value: 'Check IPO Allotment Status Instantly', category: 'general' },
        { key: 'footer_text', value: '© 2025 IPO Allotment. All data from official registrar sources.', category: 'general' },
        { key: 'rate_limit_requests', value: '10', category: 'security' },
        { key: 'rate_limit_window', value: '60000', category: 'security' },
        { key: 'auto_archive_days', value: '7', category: 'automation' }
    ];

    for (const setting of settings) {
        await prisma.systemSetting.upsert({
            where: { key: setting.key },
            update: { value: setting.value },
            create: setting
        });
    }
    console.log('✅ System settings configured');

    console.log('\n🎉 Database seeding completed!');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
