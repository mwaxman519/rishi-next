import { useState } from &quot;react&quot;;

export default function LoginPage() {
  const [username, setUsername] = useState("&quot;);
  const [password, setPassword] = useState(&quot;&quot;);
  const [error, setError] = useState(&quot;&quot;);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(&quot;&quot;);
    setIsLoading(true);

    try {
      // Direct API call without router for static export
      const response = await fetch(&quot;/api/auth/login&quot;, {
        method: &quot;POST&quot;,
        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Direct navigation for static export
        window.location.href = &quot;/dashboard&quot;;
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
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%', 
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Sign in to your account
          </h2>
        </div>
        
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor=&quot;username&quot; style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              Username
            </label>
            <input
              id=&quot;username&quot;
              name=&quot;username&quot;
              type=&quot;text&quot;
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label htmlFor=&quot;password&quot; style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              Password
            </label>
            <input
              id=&quot;password&quot;
              name=&quot;password&quot;
              type=&quot;password&quot;
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type=&quot;submit&quot;
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: isLoading ? '#9ca3af' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem'
            }}
          >
            {isLoading ? &quot;Signing In...&quot; : &quot;Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}