&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { Button } from &quot;../../components/ui/button&quot;;
import { Loader2, AlertCircle } from &quot;lucide-react&quot;;
import { SafeLink } from &quot;../../components/ui/safe-link&quot;;
import { LabeledInput } from &quot;../../components/ui/labeled-input&quot;;
import Image from &quot;next/image&quot;;

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading, register } = useAuth();
  const [error, setError] = useState("&quot;);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState(&quot;&quot;);
  const [password, setPassword] = useState(&quot;&quot;);
  const [confirmPassword, setConfirmPassword] = useState(&quot;&quot;);
  const [firstName, setFirstName] = useState(&quot;&quot;);
  const [lastName, setLastName] = useState(&quot;&quot;);
  const [registrationPasscode, setRegistrationPasscode] = useState(&quot;&quot;);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push(&quot;/dashboard&quot;);
    }
  }, [user, router]);

  // Handle register form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(&quot;&quot;);
    setIsLoading(true);

    // Basic validation
    if (!email || !password || !confirmPassword || !firstName || !lastName || !registrationPasscode) {
      setError(&quot;Please fill in all required fields&quot;);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(&quot;Passwords don&apos;t match&quot;);
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(&quot;Password must be at least 6 characters&quot;);
      setIsLoading(false);
      return;
    }

    try {
      const result = await register(
        email,
        password,
        confirmPassword,
        &quot;brand_agent&quot;,
        registrationPasscode,
      );

      if (result.success) {
        router.push(&quot;/dashboard&quot;);
      }
    } catch (error) {
      console.error(&quot;Registration error:&quot;, error);
      setError(&quot;Registration failed. Please check your information and try again.&quot;);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className=&quot;flex items-center justify-center min-h-screen&quot;>
        <Loader2 className=&quot;h-8 w-8 animate-spin text-purple-600&quot; />
      </div>
    );
  }

  return (
    <div className=&quot;min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800&quot;>
      <div className=&quot;max-w-lg w-full mx-4&quot;>
        <div className=&quot;bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700&quot;>
          {/* Logo and Title */}
          <div className=&quot;text-center mb-8&quot;>
            <div className=&quot;flex justify-center mb-4&quot;>
              <Image
                src=&quot;/favicon.ico&quot;
                alt=&quot;Rishi Platform&quot;
                width={48}
                height={48}
                className=&quot;h-12 w-12&quot;
              />
            </div>
            <h1 className=&quot;text-3xl font-bold text-gray-900 dark:text-white&quot;>
              Rishi Platform
            </h1>
            <p className=&quot;text-gray-600 dark:text-gray-400 mt-2&quot;>
              Create your account
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className=&quot;space-y-6&quot;>
            <div className=&quot;grid grid-cols-2 gap-4&quot;>
              <LabeledInput
                label=&quot;First Name&quot;
                type=&quot;text&quot;
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder=&quot;First name&quot;
                className=&quot;w-full&quot;
              />
              
              <LabeledInput
                label=&quot;Last Name&quot;
                type=&quot;text&quot;
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder=&quot;Last name&quot;
                className=&quot;w-full&quot;
              />
            </div>

            <LabeledInput
              label=&quot;Email Address&quot;
              type=&quot;email&quot;
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder=&quot;Enter your email address&quot;
              className=&quot;w-full&quot;
            />

            <LabeledInput
              label=&quot;Registration Passcode&quot;
              type=&quot;password&quot;
              value={registrationPasscode}
              onChange={(e) => setRegistrationPasscode(e.target.value)}
              required
              placeholder=&quot;Enter registration passcode&quot;
              className=&quot;w-full&quot;
            />

            <LabeledInput
              label=&quot;Password&quot;
              type=&quot;password&quot;
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder=&quot;Create a password&quot;
              className=&quot;w-full&quot;
            />

            <LabeledInput
              label=&quot;Confirm Password&quot;
              type=&quot;password&quot;
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder=&quot;Confirm your password&quot;
              className=&quot;w-full&quot;
            />

            {error && (
              <div className=&quot;bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3&quot;>
                <p className=&quot;text-sm text-red-800 dark:text-red-400&quot;>{error}</p>
              </div>
            )}

            <Button
              type=&quot;submit&quot;
              disabled={isLoading}
              className=&quot;w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200&quot;
            >
              {isLoading ? (
                <>
                  <Loader2 className=&quot;mr-2 h-4 w-4 animate-spin&quot; />
                  Creating account...
                </>
              ) : (
                &quot;Create Account&quot;
              )}
            </Button>
          </form>

          {/* Additional Links */}
          <div className=&quot;mt-6 text-center space-y-3&quot;>
            <p className=&quot;text-sm text-gray-600 dark:text-gray-400&quot;>
              Already have an account?{&quot; &quot;}
              <SafeLink
                href=&quot;/auth/login&quot;
                className=&quot;text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium&quot;
              >
                Sign in
              </SafeLink>
            </p>
            
            <div className=&quot;flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400&quot;>
              <AlertCircle className=&quot;h-3 w-3&quot; />
              <span>Registration passcode required from administrator</span>
            </div>
            
            <p className=&quot;text-xs text-gray-500 dark:text-gray-500&quot;>
              By creating an account, you agree to our{&quot; &quot;}
              <SafeLink
                href=&quot;/terms&quot;
                className=&quot;text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300&quot;
              >
                Terms of Service
              </SafeLink>{&quot; &quot;}
              and{&quot; &quot;}
              <SafeLink
                href=&quot;/privacy&quot;
                className=&quot;text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300&quot;
              >
                Privacy Policy
              </SafeLink>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className=&quot;text-center mt-8&quot;>
          <p className=&quot;text-xs text-gray-500 dark:text-gray-400">
            © 2025 Rishi Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
