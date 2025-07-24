export default function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          Rishi Platform
        </h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.9 }}>
          Mobile Workforce Management
        </p>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          borderRadius: '12px', 
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Quick Access</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '12px', 
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Dashboard</span>
              <span>→</span>
            </div>
            
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '12px', 
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Staff Management</span>
              <span>→</span>
            </div>
            
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '12px', 
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Bookings</span>
              <span>→</span>
            </div>
            
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '12px', 
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Locations</span>
              <span>→</span>
            </div>
          </div>
        </div>
        
        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
          Rishi Platform Mobile • Development Build
        </div>
      </div>
    </div>
  )
}