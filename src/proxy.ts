import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Intercept all routes starting with /admin
    if (pathname.startsWith('/a')) {
        // 1. Get session 
        const session =  await auth()
        const role = session?.user.role

        // 2. Redirect to home if session is missing or user is not an Admin
        if (!session || role !== 'admin') {
            const home = new URL('/', request.url);
            return NextResponse.redirect(home);
        }
    }
    return NextResponse.next();
}

// Only run the proxy on admin paths for faster performance
export const config = {
    matcher: ['/a/:path*'],
};
