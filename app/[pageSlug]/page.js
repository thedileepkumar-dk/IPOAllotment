import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

export async function generateMetadata({ params }) {
    const page = await prisma.page.findUnique({
        where: { slug: params.pageSlug },
        select: { title: true, seoTitle: true, seoDescription: true }
    });

    if (!page) return { title: 'Page Not Found' };

    return {
        title: page.seoTitle || page.title,
        description: page.seoDescription
    };
}

export default async function StaticPage({ params }) {
    const page = await prisma.page.findUnique({
        where: { slug: params.pageSlug }
    });

    if (!page || page.status !== 'published') {
        notFound();
    }

    return (
        <>
            <Header />
            <main>
                <section className="content-section">
                    <div className="container">
                        <div className="card">
                            <h1 style={{ marginBottom: '24px' }}>{page.title}</h1>
                            <div
                                dangerouslySetInnerHTML={{ __html: page.content }}
                                style={{
                                    color: '#a0a0a0',
                                    lineHeight: '1.8'
                                }}
                            />
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
