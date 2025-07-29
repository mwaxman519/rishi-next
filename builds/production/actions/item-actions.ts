/**
 * Production Item Actions - Client-side API wrappers
 */

'use server';

import { apiClient } from '../lib/api-client';

export async function getAllItems() {
  try {
    const response = await apiClient.get('/api/items');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching items:', error);
    return [];
  }
}

export async function getItemById(id: string) {
  try {
    const response = await apiClient.get(`/api/items/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching item:', error);
    return null;
  }
}

export async function createItem(itemData: any) {
  try {
    const response = await apiClient.post('/api/items', itemData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error creating item:', error);
    return { success: false, error: 'Failed to create item' };
  }
}

export async function updateItem(id: string, itemData: any) {
  try {
    const response = await apiClient.put(`/api/items/${id}`, itemData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating item:', error);
    return { success: false, error: 'Failed to update item' };
  }
}

export async function deleteItem(id: string) {
  try {
    await apiClient.delete(`/api/items/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting item:', error);
    return { success: false, error: 'Failed to delete item' };
  }
}