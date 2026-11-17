import { decodeJwt } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "ct_session";
const PUBLIC_ROUTES = new Set(["/login"]);

/**
 * Optimistic route protection. This only checks that a session cookie exists and is not
 * expired — it deliberately holds no signing secret. The API verifies the signature and
 * role on every request, so a forged cookie gets past this redirect but receives no data.
 */
function hasLiveSession(req: NextRequest): boolean {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    const { exp } = decodeJwt(token);
    return typeof exp === "number" && exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const authed = hasLiveSession(req);

  if (PUBLIC_ROUTES.has(pathname)) {
    return authed ? NextResponse.redirect(new URL("/dashboard", req.url)) : NextResponse.next();
  }

  if (!authed) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", `${pathname}${search}`);
    const res = NextResponse.redirect(login);
    if (req.cookies.has(SESSION_COOKIE)) res.cookies.delete(SESSION_COOKIE); // expired → clear
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt)$).*)"],
};
