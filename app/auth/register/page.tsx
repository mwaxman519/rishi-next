"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { SafeLink } from "../../components/ui/safe-link";
import { LabeledInput } from "../../components/ui/labeled-input";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading, register } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registrationPasscode, setRegistrationPasscode] = useState("");

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Handle register form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic validation
    if (!email || !password || !confirmPassword || !firstName || !lastName || !registrationPasscode) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const result = await register(
        email,
        password,
        confirmPassword,
        "brand_agent",
        registrationPasscode,
      );

      if (result.success) {
        // Use window.location.href for immediate navigation without reverting button state
        window.location.href = "/dashboard";
        // Don't set isLoading to false here - let the navigation handle it
      } else {
        setError("Registration failed. Please check your information and try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Registration failed. Please check your information and try again.");
      setIsLoading(false);
    }
  };

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-lg w-full mx-4">
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
              Create your account
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <LabeledInput
                label="First Name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="First name"
                className="w-full"
              />
              
              <LabeledInput
                label="Last Name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Last name"
                className="w-full"
              />
            </div>

            <LabeledInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email address"
              className="w-full"
            />

            <LabeledInput
              label="Registration Passcode"
              type="password"
              value={registrationPasscode}
              onChange={(e) => setRegistrationPasscode(e.target.value)}
              required
              placeholder="Enter registration passcode"
              className="w-full"
            />

            <LabeledInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
              className="w-full"
            />

            <LabeledInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
              className="w-full"
            />

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
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <SafeLink
                href="/auth/login"
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
              >
                Sign in
              </SafeLink>
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <AlertCircle className="h-3 w-3" />
              <span>Registration passcode required from administrator</span>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-500">
              By creating an account, you agree to our{" "}
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
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2025 Rishi Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
