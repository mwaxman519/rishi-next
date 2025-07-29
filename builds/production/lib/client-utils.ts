/**
 * Client-side utility functions
 * Provides utility functions specifically for client-side usage
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine class names with Tailwind CSS merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if code is running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if code is running in iframe
 */
export function isInIframe(): boolean {
  if (!isBrowser()) return false;
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

/**
 * Get current URL without causing SSR issues
 */
export function getCurrentUrl(): string {
  if (!isBrowser()) return '';
  return window.location.href;
}

/**
 * Get query parameter value
 */
export function getQueryParam(name: string): string | null {
  if (!isBrowser()) return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * Set query parameter
 */
export function setQueryParam(name: string, value: string): void {
  if (!isBrowser()) return;
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  window.history.replaceState({}, '', url.toString());
}

/**
 * Remove query parameter
 */
export function removeQueryParam(name: string): void {
  if (!isBrowser()) return;
  const url = new URL(window.location.href);
  url.searchParams.delete(name);
  window.history.replaceState({}, '', url.toString());
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!isBrowser()) return false;
  
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      return true;
    } catch (e) {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

/**
 * Download data as file
 */
export function downloadAsFile(data: string, filename: string, type = 'text/plain'): void {
  if (!isBrowser()) return;
  
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Get local storage item safely
 */
export function getLocalStorageItem(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

/**
 * Set local storage item safely
 */
export function setLocalStorageItem(key: string, value: string): boolean {
  if (!isBrowser()) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Remove local storage item safely
 */
export function removeLocalStorageItem(key: string): boolean {
  if (!isBrowser()) return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, wait);
    }
  };
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: Element): boolean {
  if (!isBrowser()) return false;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Smooth scroll to element
 */
export function scrollToElement(element: Element | string, offset = 0): void {
  if (!isBrowser()) return;
  
  const target = typeof element === 'string' 
    ? document.querySelector(element) 
    : element;
    
  if (!target) return;
  
  const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
  
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
}

// Default export for compatibility
export default {
  cn,
  isBrowser,
  isInIframe,
  getCurrentUrl,
  getQueryParam,
  setQueryParam,
  removeQueryParam,
  copyToClipboard,
  downloadAsFile,
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
  debounce,
  throttle,
  formatFileSize,
  generateId,
  isInViewport,
  scrollToElement,
};