import { NextResponse } from 'next/server';
import { prisma } from './app/lib/prisma';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Check for redirects
    try {
        const redirect = await prisma.redirect.findUnique({
            where: {
                sourceUrl: pathname,
                isActive: true
            }
        });

        if (redirect) {
            // Increment hit counter asynchronously
            prisma.redirect.update({
                where: { id: redirect.id },
                data: { hits: { increment: 1 } }
            }).catch(console.error);

            // Perform redirect
            return NextResponse.redirect(
                new URL(redirect.destinationUrl, request.url),
                redirect.statusCode
            );
        }
    } catch (error) {
        console.error('Redirect middleware error:', error);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public directory)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
