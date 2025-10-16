import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Type definition for route patterns
 */
type RoutePattern = {
  /** Path prefix that identifies this route type */
  readonly prefix: string;
  /** Whether this route requires authentication */
  readonly requiresAuth: boolean;
  /** Description of the route type */
  readonly description: string;
};

/**
 * Protected route patterns that require authentication
 */
const PROTECTED_ROUTES: readonly RoutePattern[] = [
  {
    prefix: "/dashboard",
    requiresAuth: true,
    description: "Main dashboard area",
  },
  { prefix: "/guests", requiresAuth: true, description: "Guest management" },
  { prefix: "/settings", requiresAuth: true, description: "User settings" },
  { prefix: "/profile", requiresAuth: true, description: "User profile" },
] as const;

/**
 * Check if a pathname belongs to the dashboard route group
 * Dashboard routes require authentication
 *
 * @param pathname - The URL pathname to check
 * @returns True if the path requires authentication
 */
function isDashboardRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route.prefix));
}

/**
 * Validate redirect URL to prevent open redirect vulnerabilities
 * Only allows internal redirects that start with / and don't point to auth pages
 *
 * Security checks:
 * - Must start with / (internal only)
 * - Cannot redirect to /auth routes (prevent loops)
 * - Must match valid path pattern
 * - Length must be under 2000 characters
 *
 * @param url - The redirect URL to validate
 * @returns Validated URL or /dashboard as fallback
 */
function validateRedirectUrl(url: string): string {
  // Must start with / and not be an external URL
  if (!url.startsWith("/")) {
    return "/dashboard";
  }

  // Prevent redirect loops to auth pages
  if (url.startsWith("/auth")) {
    return "/dashboard";
  }

  // Check for valid internal path pattern (allow letters, numbers, /, _, -)
  const internalPathRegex = /^\/[a-zA-Z0-9\/_-]*$/;
  if (!internalPathRegex.test(url)) {
    return "/dashboard";
  }

  // Length check to prevent very long URLs
  if (url.length > 2000) {
    return "/dashboard";
  }

  return url;
}

/**
 * Middleware for authentication and session management
 * Runs on every request to refresh session and protect routes
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Extract pathname and classify the route type
  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith("/auth");
  const isPublicRoute = pathname === "/";
  const isProtectedRoute = isDashboardRoute(pathname);

  // CASE 1: Authenticated user trying to access auth pages (login/register)
  // → Redirect to dashboard (they're already logged in)
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // CASE 2: Unauthenticated user trying to access protected routes
  // → Redirect to login with return URL preserved
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    // Preserve the originally requested URL for post-login redirect
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // CASE 3: Unauthenticated user on other routes (not public, not auth)
  // → Redirect to login as a safety catch-all
  if (!user && !isAuthRoute && !isPublicRoute && !isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // CASE 4: Valid access - Allow request to proceed
  // - Authenticated users accessing protected routes
  // - Anyone accessing public routes
  // - Unauthenticated users accessing auth routes

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (public files)
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|icons/|images/|manifest.json|sw.js|workbox-.*|worker-.*|.*\\..*|api/).*)",
  ],
};
