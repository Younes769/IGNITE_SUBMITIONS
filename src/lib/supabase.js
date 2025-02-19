import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Client-side Supabase instance
export const createClient = () => {
  return createClientComponentClient({
    cookieOptions: {
      name: "sb-session",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  });
};

// For backwards compatibility
export const supabase = createClientComponentClient();
