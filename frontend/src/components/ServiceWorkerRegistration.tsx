"use client"
import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Defer service worker registration to avoid blocking main thread
    const registerServiceWorker = () => {
      if ('serviceWorker' in navigator) {
        // Use requestIdleCallback if available, otherwise setTimeout
        const scheduleRegistration = (callback: () => void) => {
          if ('requestIdleCallback' in window) {
            requestIdleCallback(callback);
          } else {
            setTimeout(callback, 0);
          }
        };

        scheduleRegistration(() => {
          navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
              console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
              console.error('Service Worker registration failed:', error);
            });
        });
      }
    };

    // Register after initial page load
    if (document.readyState === 'complete') {
      registerServiceWorker();
    } else {
      window.addEventListener('load', registerServiceWorker);
      return () => window.removeEventListener('load', registerServiceWorker);
    }
  }, []);

  return null;
}