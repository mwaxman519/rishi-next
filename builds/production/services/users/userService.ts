/**
 * Production User Service - Client-side API calls to Vercel serverless
 */

import { apiClient } from '../../lib/api-client';

export class UserService {
  async getAllUsers() {
    return apiClient.get('/api/users');
  }

  async getUserById(id: string) {
    return apiClient.get(`/api/users/${id}`);
  }

  async getUsersByRole(role: string) {
    return apiClient.get(`/api/users/by-role/${role}`);
  }

  async createUser(userData: any) {
    return apiClient.post('/api/users', userData);
  }

  async updateUser(id: string, userData: any) {
    return apiClient.put(`/api/users/${id}`, userData);
  }

  async deleteUser(id: string) {
    return apiClient.delete(`/api/users/${id}`);
  }

  async getUserWithCredentials(username: string) {
    return apiClient.get(`/api/users/credentials/${username}`);
  }

  async getUserByUsername(username: string) {
    return apiClient.get(`/api/users/username/${username}`);
  }
}

export const userService = new UserService();

// Export functions that match the server-side pattern
export const getAllUsers = () => userService.getAllUsers();
export const getUserById = (id: string) => userService.getUserById(id);
export const getUsersByRole = (role: string) => userService.getUsersByRole(role);
export const createUser = (userData: any) => userService.createUser(userData);
export const updateUser = (id: string, userData: any) => userService.updateUser(id, userData);
export const deleteUser = (id: string) => userService.deleteUser(id);
export const getUserWithCredentials = (username: string) => userService.getUserWithCredentials(username);
export const getUserByUsername = (username: string) => userService.getUserByUsername(username);