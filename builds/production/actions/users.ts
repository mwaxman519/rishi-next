/**
 * Production User Actions - Client-side API wrappers
 */

'use server';

import { apiClient } from '../lib/api-client';

export async function getAllUsers() {
  try {
    const response = await apiClient.get('/api/users');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function getUserById(id: string) {
  try {
    const response = await apiClient.get(`/api/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function getUsersByRole(role: string) {
  try {
    const response = await apiClient.get(`/api/users/by-role/${role}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching users by role:', error);
    return [];
  }
}

export async function createUser(userData: any) {
  try {
    const response = await apiClient.post('/api/users', userData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

export async function updateUser(id: string, userData: any) {
  try {
    const response = await apiClient.put(`/api/users/${id}`, userData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'Failed to update user' };
  }
}

export async function deleteUser(id: string) {
  try {
    await apiClient.delete(`/api/users/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}