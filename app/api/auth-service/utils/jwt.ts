import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

export async function signJwt(payload: any): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);

  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  return jwt;
}

export async function verifyJwt(token: string): Promise<any> {
  try {
    if (!token || typeof token !== 'string') {
      console.error('Invalid token provided to verifyJwt');
      return null;
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    
    console.log('JWT verification successful, payload:', {
      id: payload.id,
      username: payload.username,
      role: payload.role
    });
    
    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}