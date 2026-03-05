import { NextResponse } from 'next/server'

// Firebase auth does not use server-side code exchange callbacks.
// This route is kept for compatibility but simply redirects to dashboard.
export async function GET(request) {
    const { origin } = new URL(request.url)
    return NextResponse.redirect(`${origin}/dashboard`)
}
