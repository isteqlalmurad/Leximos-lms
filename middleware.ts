// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('Middleware running on path:', req.nextUrl.pathname);
  
  // Create a Supabase middleware client
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired
  await supabase.auth.getSession();

  // Protected routes that require authentication
  const protectedRoutes = ['/my-courses', '/dashboard', '/instructor'];
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const { data: { session } } = await supabase.auth.getSession();

    // Redirect to home page instead of /auth/signin if no session
    if (!session) {
      console.log('No session, redirecting from protected route to home');
      const redirectUrl = new URL('/', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|static|api/auth|favicon.ico|images).*)',
  ],
};