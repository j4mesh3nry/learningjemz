// src/utils/registerSW.ts
/**
 * Registers the Service Worker and sets up automatic update checking.
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Only register in production or when explicitly enabled
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Check for updates periodically every 30 minutes
        setInterval(() => {
          registration.update().catch(() => {});
        }, 30 * 60 * 1000);

        // Track state changes on new installing service workers
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available; send skipWaiting to active worker
                installingWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            }
          };
        };
      })
      .catch((error) => {
        console.warn('[SW] Registration failed:', error);
      });

    // Auto-reload window when new service worker takes control to apply updates seamlessly
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}
