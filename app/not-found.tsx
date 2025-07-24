export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '2rem' }}>
        The page you're looking for doesn't exist in the mobile app.
      </p>
      <div style={{
        background: 'rgba(255,255,255,0.2)',
        padding: '12px 24px',
        borderRadius: '8px',
        cursor: 'pointer'
      }}>
        Return to Home
      </div>
    </div>
  )
}