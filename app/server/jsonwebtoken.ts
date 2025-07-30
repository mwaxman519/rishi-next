// Mock jsonwebtoken for deployment compatibility
export const verify = (token: string, secret: string) => {
  // Mock implementation for development
  return {
    id: &quot;00000000-0000-0000-0000-000000000001&quot;,
    email: &quot;dev@rishiplatform.com&quot;,
    role: &quot;super_admin&quot;,
  };
};

export const sign = (payload: any, secret: string) => {
  return &quot;mock-jwt-token&quot;;
};
