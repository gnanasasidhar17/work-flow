import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Appwrite Cloud cookies belong to cloud.appwrite.io and cannot be natively read
  // by Next.js middleware running on local/Vercel domains due to cross-site isolation.
  // We completely rely on the React Layout `useCurrentUser` protection strategy.
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
