import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth/server';

export async function middleware(request: NextRequest) {
  if (!auth) {
    if (request.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = '/auth/sign-in';
    url.searchParams.set('error', 'auth-not-configured');
    return NextResponse.redirect(url);
  }

  return auth.middleware({ loginUrl: '/auth/sign-in' })(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
