// Mobile app environment configuration
// This file configures API endpoints for the mobile app

const MOBILE_CONFIG = {
  // Replit development server (your actual backend)
  API_BASE_URL: 'https://3517da39-7603-40ea-b364-fdfd91837371-00-33fp2yev8yflw.spock.replit.dev',
  
  // API endpoints
  ENDPOINTS: {
    AUTH: '/api/auth-service/session',
    BOOKINGS: '/api/bookings',
    LOCATIONS: '/api/locations',
    STAFF: '/api/staff',
    INVENTORY: '/api/inventory/kits',
    PREFERENCES: '/api/user-organization-preferences'
  },
  
  // Mobile app settings
  MOBILE_MODE: true,
  OFFLINE_SUPPORT: true,
  
  // CORS and security settings for mobile
  MOBILE_HEADERS: {
    'Content-Type': 'application/json',
    'X-Mobile-App': 'rishi-platform',
    'Accept': 'application/json'
  }
};

// Make config available globally for mobile app
if (typeof window !== 'undefined') {
  window.RISHI_MOBILE_CONFIG = MOBILE_CONFIG;
}

module.exports = MOBILE_CONFIG;