import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development-use-only-never-in-production';

console.log('[JWT Utils] JWT_SECRET source:', process.env.JWT_SECRET ? 'environment variable' : 'fallback');

export async function signJwt(payload: any): Promise<string> {
  try {
    console.log('[JWT Utils] Signing JWT for payload:', {
      id: payload.id,
      username: payload.username,
      role: payload.role
    });

    const secret = new TextEncoder().encode(JWT_SECRET);

    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    console.log('[JWT Utils] JWT signed successfully, length:', jwt.length);
    return jwt;
  } catch (error) {
    console.error('[JWT Utils] JWT signing failed:', error);
    throw error;
  }
}

export async function verifyJwt(token: string): Promise<any> {
  try {
    console.log('[JWT Utils] Starting JWT verification');
    console.log('[JWT Utils] Token length:', token?.length || 0);
    console.log('[JWT Utils] Secret available:', !!JWT_SECRET);

    if (!token || typeof token !== 'string') {
      console.error('[JWT Utils] Invalid token provided to verifyJwt:', typeof token);
      return null;
    }

    if (token.length < 10) {
      console.error('[JWT Utils] Token too short to be valid JWT');
      return null;
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    console.log('[JWT Utils] Secret encoded, starting verification');

    const { payload } = await jose.jwtVerify(token, secret);
    
    console.log('[JWT Utils] JWT verification successful, payload keys:', Object.keys(payload));
    console.log('[JWT Utils] JWT verification successful, payload:', {
      id: payload.id,
      username: payload.username,
      role: payload.role,
      iat: payload.iat,
      exp: payload.exp
    });
    
    return payload;
  } catch (error) {
    console.error('[JWT Utils] JWT verification failed with error:', error);
    console.error('[JWT Utils] Error type:', error.constructor.name);
    console.error('[JWT Utils] Error message:', error.message);
    
    // Check if it's an expired token
    if (error.message?.includes('expired')) {
      console.error('[JWT Utils] Token has expired');
    }
    
    // Check if it's a signature verification error
    if (error.message?.includes('signature')) {
      console.error('[JWT Utils] Token signature verification failed - possibly wrong secret');
    }
    
    return null;
  }
}