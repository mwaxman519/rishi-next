"use client";

import { useState } from "react";
import { SafeLink } from "@/components/ui/safe-link";
import Image from "next/image";
import { useRouter } from "next/navigation";
// Removed useAuth dependency to fix loading issues
import { LabeledInput } from "@/components/ui/labeled-input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // Direct authentication without useAuth hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful:", data);
        // Use router.push but don't set isLoading to false - let navigation complete
        router.push("/dashboard");
        // Keep button in loading state during navigation
        return;
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Login failed. Please check your credentials.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/favicon.ico"
                alt="Rishi Platform"
                width={48}
                height={48}
                className="h-12 w-12"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Rishi Platform
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Sign in to your account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <LabeledInput
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
                className="w-full"
              />
              
              <LabeledInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <SafeLink
                href="/auth/register"
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
              >
                Sign up
              </SafeLink>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              By signing in, you agree to our{" "}
              <SafeLink
                href="/terms"
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                Terms of Service
              </SafeLink>{" "}
              and{" "}
              <SafeLink
                href="/privacy"
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                Privacy Policy
              </SafeLink>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2025 Rishi Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}