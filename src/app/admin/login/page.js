"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Image from "next/image";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Login attempt started");
    setIsLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      console.log("Attempting to sign in...");
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

      if (signInError) {
        console.error("Sign in error:", signInError);
        throw signInError;
      }

      console.log("Sign in response:", data);

      if (data?.session) {
        console.log("Session obtained, checking role...");

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }

        console.log("Profile data:", profileData);

        if (profileData?.role !== "admin") {
          console.log("Non-admin user detected, signing out...");
          await supabase.auth.signOut();
          throw new Error("Unauthorized access");
        }

        console.log("Admin role confirmed, redirecting...");

        // Set session and redirect
        await supabase.auth.setSession(data.session);
        router.push("/admin");
        router.refresh();
      } else {
        throw new Error("No session data received");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.message === "Invalid login credentials"
          ? "Invalid email or password"
          : error.message || "An error occurred during login. Please try again."
      );
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-lg shadow-xl">
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-4 mb-6">
            <Image
              src="/logo_nit_.png"
              alt="NIT Logo"
              width={48}
              height={48}
              className="h-12 w-auto"
            />
            <Image
              src="/white_logo.png"
              alt="Club Logo"
              width={48}
              height={48}
              className="h-12 w-auto"
            />
          </div>
          <h2 className="text-2xl font-bold text-primary">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to access the admin dashboard
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-black border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary text-white"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-black border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary text-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
