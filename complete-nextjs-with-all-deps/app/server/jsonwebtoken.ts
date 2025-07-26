// Mock jsonwebtoken for deployment compatibility
export const verify = (token: string, secret: string) => {
  // Mock implementation for development
  return {
    id: "00000000-0000-0000-0000-000000000001",
    email: "dev@rishiplatform.com",
    role: "super_admin",
  };
};

export const sign = (payload: any, secret: string) => {
  return "mock-jwt-token";
};
