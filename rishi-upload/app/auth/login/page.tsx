"use client";

import { useState } from "react";
import { SafeLink } from "../../components/ui/safe-link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { LabeledInput } from "../../components/ui/labeled-input";
import { Button } from "../../components/ui/button";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const navigateSafely = (path: string) => {
    try {
      // First try using Next.js router
      router.push(path);
    } catch (routerError) {
      console.error("Router navigation failed:", routerError);

      // If that fails, try a standard redirect
      try {
        window.location.href = path;
      } catch (locationError) {
        console.error("Location navigation failed:", locationError);
        // Last resort - reload the page
        window.location.reload();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Try/catch with error handling for production safety
      if (typeof login === "function") {
        // Our login function returns a boolean indicating success
        const success = await login(username, password);

        if (success) {
          // Use our safe navigation function instead of router.push directly
          navigateSafely("/dashboard");
        } else {
          setError("Login failed. Please check your credentials.");
        }
      } else {
        // Fallback for production if login function is not available
        // Make a direct fetch call to the API
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
          // Redirect on successful login
          navigateSafely("/dashboard");
        } else {
          // Show error message
          const data = await response.json().catch(() => ({}));
          setError(
            data.message || "Login failed. Please check your credentials.",
          );
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--background))]">
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left side - Logo and brand info */}
        <div className="hidden md:flex md:w-1/2 bg-[rgb(var(--primary))] text-white p-8 flex-col justify-between">
          <div>
            <div className="w-48 h-48 relative mb-8">
              <Image
                src="/favicon.ico"
                alt="Rishi Logo"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
            <h1 className="text-4xl font-bold mb-4">Rishi</h1>
            <p className="text-xl mb-6">
              Cannabis Workforce Management Platform
            </p>
            <p className="text-lg opacity-90">
              Login to access your Rishi Brand Agent dashboard, manage your
              availability and schedule.
            </p>
          </div>

          <div className="mt-auto">
            <p className="text-sm opacity-75">
              © {new Date().getFullYear()} Rishi. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="md:hidden flex justify-center mb-8">
              <div className="w-32 h-32 relative">
                <Image
                  src="/favicon.ico"
                  alt="Rishi Logo"
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-[rgb(var(--foreground))]">
              Sign in to your account
            </h2>

            {error && (
              <div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6"
                role="alert"
              >
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <LabeledInput
                  label="Username"
                  name="username"
                  id="username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  fullWidth
                />
              </div>

              <div>
                <LabeledInput
                  label="Password"
                  name="password"
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-[rgb(var(--muted))] text-[rgb(var(--primary))] focus:ring-[rgb(var(--ring))]"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-[rgb(var(--muted-foreground))]"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-[rgb(var(--primary))] hover:opacity-80"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  variant="default"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                Don&apos;t have an account?{" "}
                <SafeLink
                  href="/auth/register"
                  className="font-medium text-[rgb(var(--primary))] hover:opacity-80"
                >
                  Sign up
                </SafeLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
