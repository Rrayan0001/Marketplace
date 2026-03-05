import { NextResponse } from 'next/server';

// NOTE: firebase-admin cannot run in Edge Runtime.
// Middleware does a lightweight cookie-presence check.
// Full token verification is done in each server layout/page using firebase-admin.
export async function middleware(request) {
    const session = request.cookies.get('session')?.value;
    const { pathname } = request.nextUrl;

    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
    const isProtectedRoute =
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/onboarding') ||
        pathname.startsWith('/admin');

    if (!isProtectedRoute && !isAuthRoute) {
        return NextResponse.next();
    }

    // If no session cookie at all, redirect unauthenticated users
    if (!session && isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // If session exists and user hits auth routes, redirect to dashboard
    if (session && isAuthRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
