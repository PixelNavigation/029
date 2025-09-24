import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Setup MSW worker for browser environment
export const worker = setupWorker(...handlers);

// Start the worker in development environment
export const startMSW = async () => {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
    try {
      await worker.start({
        onUnhandledRequest: 'bypass', // Let unhandled requests pass through
        serviceWorker: {
          url: '/mockServiceWorker.js', // MSW service worker file
        },
      });
      
      console.log('🔶 Mock Service Worker started');
      
      // Log all mocked endpoints for development
      console.log('🔶 Mocked API endpoints:');
      handlers.forEach((handler) => {
        // Extract method and path from handler info
        const handlerInfo = handler.info;
        if (handlerInfo.header) {
          console.log(`  ${handlerInfo.header}`);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to start Mock Service Worker:', error);
      return false;
    }
  }
  
  return false;
};

// Stop the worker (useful for testing or when switching to real API)
export const stopMSW = () => {
  if (worker) {
    worker.stop();
    console.log('🔶 Mock Service Worker stopped');
  }
};

// Reset handlers (useful for testing)
export const resetMSW = () => {
  if (worker) {
    worker.resetHandlers();
    console.log('🔶 Mock Service Worker handlers reset');
  }
};

// Add runtime handler (useful for dynamic mocking)
export const addMSWHandler = (...newHandlers) => {
  if (worker) {
    worker.use(...newHandlers);
  }
};