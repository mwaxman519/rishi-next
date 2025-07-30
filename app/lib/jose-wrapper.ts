// Edge-compatible wrapper for jose functions
import {
  SignJWT,
  createRemoteJWKSet,
  JWTPayload,
  jwtVerify as joseJwtVerify,
} from &quot;jose&quot;;

// Export jose functions
export { SignJWT, createRemoteJWKSet };

// Custom wrapper for jwtVerify with better error handling and explicit return type
export async function jwtVerify(
  token: string,
  secret: Uint8Array,
): Promise<{ payload: JWTPayload }> {
  try {
    // Use the jose library's jwtVerify function directly
    const result = await joseJwtVerify(token, secret);
    return result;
  } catch (error) {
    console.error(&quot;JWT verification error in wrapper:&quot;, error);

    // Log additional debugging information (Edge-compatible)
    console.log(&quot;Token length:&quot;, token.length);
    console.log(&quot;Secret length:&quot;, secret.length);

    throw error; // Re-throw the error for the caller to handle
  }
}
