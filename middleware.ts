import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PRO_ROUTES = [
  '/dashboard/financeiro',
  '/dashboard/clientes',
  '/dashboard/orcamentos',
];

export function middleware(
  request: NextRequest
) {
  const pathname =
    request.nextUrl.pathname;

  const plan =
    request.cookies.get('plan')
      ?.value || 'basic';

  const isProRoute =
    PRO_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

  if (
    isProRoute &&
    plan !== 'pro'
  ) {
    return NextResponse.redirect(
      new URL(
        '/assinatura',
        request.url
      )
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/financeiro/:path*',
    '/dashboard/clientes/:path*',
    '/dashboard/orcamentos/:path*',
  ],
};