// Mobile-specific optimizations for Rishi Platform
export class MobileOptimizationService {
  static initializeMobileFeatures() {
    // Enable mobile-specific features
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }

  static optimizeForMobile() {
    // Mobile performance optimizations
    if (typeof document !== 'undefined') {
      document.addEventListener('DOMContentLoaded', () => {
        // Prevent zoom on input focus
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(meta);
      });
    }
  }
}
