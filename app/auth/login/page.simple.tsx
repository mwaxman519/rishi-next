&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import Image from &quot;next/image&quot;;
import { useRouter } from &quot;next/navigation&quot;;

export default function LoginPage() {
  const [username, setUsername] = useState("&quot;);
  const [password, setPassword] = useState(&quot;&quot;);
  const [error, setError] = useState(&quot;&quot;);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(&quot;&quot;);
    setIsLoading(true);

    try {
      const response = await fetch(&quot;/api/auth/login&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        router.push(&quot;/dashboard&quot;);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.message || &quot;Login failed. Please check your credentials.&quot;);
      }
    } catch (err) {
      setError(&quot;An unexpected error occurred. Please try again.&quot;);
      console.error(&quot;Login error:&quot;, err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=&quot;min-h-screen flex items-center justify-center bg-gray-50&quot;>
      <div className=&quot;max-w-md w-full space-y-8&quot;>
        <div>
          <div className=&quot;mx-auto h-12 w-12 relative&quot;>
            <Image
              src=&quot;/favicon.ico&quot;
              alt=&quot;Rishi Logo&quot;
              fill
              style={{ objectFit: &quot;contain&quot; }}
              priority
            />
          </div>
          <h2 className=&quot;mt-6 text-center text-3xl font-extrabold text-gray-900&quot;>
            Sign in to your account
          </h2>
        </div>
        
        {error && (
          <div className=&quot;bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded&quot;>
            {error}
          </div>
        )}

        <form className=&quot;mt-8 space-y-6&quot; onSubmit={handleSubmit}>
          <div>
            <label htmlFor=&quot;username&quot; className=&quot;block text-sm font-medium text-gray-700&quot;>
              Username
            </label>
            <input
              id=&quot;username&quot;
              name=&quot;username&quot;
              type=&quot;text&quot;
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className=&quot;mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500&quot;
            />
          </div>

          <div>
            <label htmlFor=&quot;password&quot; className=&quot;block text-sm font-medium text-gray-700&quot;>
              Password
            </label>
            <input
              id=&quot;password&quot;
              name=&quot;password&quot;
              type=&quot;password&quot;
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className=&quot;mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500&quot;
            />
          </div>

          <div>
            <button
              type=&quot;submit&quot;
              disabled={isLoading}
              className=&quot;group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400&quot;
            >
              {isLoading ? &quot;Signing In...&quot; : &quot;Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}