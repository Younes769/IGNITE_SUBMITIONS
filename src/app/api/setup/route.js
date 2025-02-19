import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Create admin user
    const { data: userData, error: userError } =
      await supabase.auth.admin.createUser({
        email: "adminsub@gmail.com",
        password: "Auth9898Sub",
        email_confirm: true,
      });

    if (userError) throw userError;

    // Insert into profiles table
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: userData.user.id,
        role: "admin",
      },
    ]);

    if (profileError) throw profileError;

    return NextResponse.json({
      message: "Admin user created successfully",
      user: userData.user,
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
