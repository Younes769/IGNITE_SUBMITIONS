import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    // Refresh the session if needed
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // For debugging
    console.log("Middleware - Path:", req.nextUrl.pathname);
    console.log("Middleware - Session:", session ? "exists" : "none");

    if (session) {
      console.log("Middleware - User ID:", session.user.id);
    }

    // Handle login page access
    if (req.nextUrl.pathname === "/admin/login") {
      if (!session) {
        return res;
      }

      // Check if user is admin when accessing login page with session
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profileData?.role === "admin") {
        const response = NextResponse.redirect(new URL("/admin", req.url));
        await supabase.auth.setSession(session);
        return response;
      }
    }

    // Protect admin routes
    if (
      req.nextUrl.pathname.startsWith("/admin") &&
      req.nextUrl.pathname !== "/admin/login"
    ) {
      if (!session) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }

      // Verify admin role
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profileError || profileData?.role !== "admin") {
        console.error(
          "Admin verification failed:",
          profileError || "Not admin"
        );
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }

      console.log("Admin access granted for:", req.nextUrl.pathname);
    }

    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
