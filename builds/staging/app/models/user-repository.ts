// User repository for mobile app (points to remote API)
import { apiClient } from '@/lib/api-config';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  organizationId: string;
}

export const userRepository = {
  async getAllUsers(): Promise<User[]> {
    return apiClient.get('/api/users');
  },
  
  async getUserById(id: string): Promise<User | null> {
    try {
      return await apiClient.get(`/api/users/${id}`);
    } catch (error) {
      return null;
    }
  },
  
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      return await apiClient.get(`/api/users?username=${username}`);
    } catch (error) {
      return null;
    }
  },
  
  async createUser(userData: Partial<User>): Promise<User> {
    return apiClient.post('/api/users', userData);
  },
  
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return apiClient.put(`/api/users/${id}`, userData);
  },
  
  async deleteUser(id: string): Promise<void> {
    return apiClient.delete(`/api/users/${id}`);
  }
};
