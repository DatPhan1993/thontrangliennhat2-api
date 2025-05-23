/**
 * 🔧 Cache & URL Fix Tool for Frontend
 * ===================================
 * 
 * This script fixes localhost URLs and cache issues in the frontend.
 * Include this script in your frontend HTML or run in browser console.
 */

(function() {
  'use strict';
  
  console.log('🔧 Starting Cache & URL Fix Tool...');
  
  // Configuration
  const CONFIG = {
    oldDomain: 'http://localhost:3001',
    newDomain: 'https://api.thontrangliennhat.com',
    debug: true
  };
  
  /**
   * 1. Fix existing images with localhost URLs
   */
  function fixExistingImages() {
    let fixedCount = 0;
    
    document.querySelectorAll('img').forEach(img => {
      if (img.src.includes(CONFIG.oldDomain)) {
        const oldSrc = img.src;
        img.src = img.src.replace(CONFIG.oldDomain, CONFIG.newDomain);
        fixedCount++;
        
        if (CONFIG.debug) {
          console.log(`✅ Fixed image: ${oldSrc} -> ${img.src}`);
        }
      }
    });
    
    // Fix background images in CSS
    document.querySelectorAll('*').forEach(element => {
      const style = window.getComputedStyle(element);
      const bgImage = style.backgroundImage;
      
      if (bgImage && bgImage.includes(CONFIG.oldDomain)) {
        const newBgImage = bgImage.replace(CONFIG.oldDomain, CONFIG.newDomain);
        element.style.backgroundImage = newBgImage;
        fixedCount++;
        
        if (CONFIG.debug) {
          console.log(`✅ Fixed background: ${bgImage} -> ${newBgImage}`);
        }
      }
    });
    
    console.log(`✅ Fixed ${fixedCount} existing images/backgrounds`);
    return fixedCount;
  }
  
  /**
   * 2. Monitor for new images being added to the DOM
   */
  function setupImageObserver() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            // Check if the node itself is an img
            const images = node.tagName === 'IMG' ? [node] : node.querySelectorAll('img');
            
            images.forEach(img => {
              if (img.src.includes(CONFIG.oldDomain)) {
                const oldSrc = img.src;
                img.src = img.src.replace(CONFIG.oldDomain, CONFIG.newDomain);
                
                if (CONFIG.debug) {
                  console.log(`✅ Fixed new image: ${oldSrc} -> ${img.src}`);
                }
              }
            });
          }
        });
      });
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    console.log('✅ Image observer setup complete');
    return observer;
  }
  
  /**
   * 3. Clear all types of cache
   */
  async function clearAllCache() {
    let clearedCount = 0;
    
    try {
      // Clear Service Worker cache
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
          clearedCount++;
        }
        console.log(`✅ Cleared ${registrations.length} service workers`);
      }
      
      // Clear Cache API
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log(`✅ Cleared ${cacheNames.length} cache storages`);
        clearedCount += cacheNames.length;
      }
      
      // Clear localStorage
      const localStorageSize = localStorage.length;
      localStorage.clear();
      console.log(`✅ Cleared localStorage (${localStorageSize} items)`);
      
      // Clear sessionStorage
      const sessionStorageSize = sessionStorage.length;
      sessionStorage.clear();
      console.log(`✅ Cleared sessionStorage (${sessionStorageSize} items)`);
      
      console.log(`✅ Total cache clearing operations: ${clearedCount + localStorageSize + sessionStorageSize}`);
      
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
    }
  }
  
  /**
   * 4. Fix fetch requests to use production API
   */
  function setupFetchInterceptor() {
    const originalFetch = window.fetch;
    
    window.fetch = function(input, init) {
      // If input is a string and contains localhost, replace it
      if (typeof input === 'string' && input.includes(CONFIG.oldDomain)) {
        input = input.replace(CONFIG.oldDomain, CONFIG.newDomain);
        
        if (CONFIG.debug) {
          console.log(`✅ Fixed fetch URL: ${input}`);
        }
      }
      
      // If input is a Request object
      if (input instanceof Request && input.url.includes(CONFIG.oldDomain)) {
        const newUrl = input.url.replace(CONFIG.oldDomain, CONFIG.newDomain);
        input = new Request(newUrl, input);
        
        if (CONFIG.debug) {
          console.log(`✅ Fixed fetch Request: ${newUrl}`);
        }
      }
      
      // Add cache-busting for API calls
      if (typeof input === 'string' && input.includes('/api/')) {
        const separator = input.includes('?') ? '&' : '?';
        input = `${input}${separator}_=${Date.now()}`;
      }
      
      return originalFetch.call(this, input, init);
    };
    
    console.log('✅ Fetch interceptor setup complete');
  }
  
  /**
   * 5. Main execution function
   */
  async function main() {
    console.log('🚀 Running all fixes...');
    
    // Fix existing images
    const fixedImages = fixExistingImages();
    
    // Setup observers for new content
    const observer = setupImageObserver();
    
    // Setup fetch interceptor
    setupFetchInterceptor();
    
    // Clear cache
    await clearAllCache();
    
    console.log('✅ All fixes completed!');
    console.log(`📊 Summary:
    - Fixed ${fixedImages} existing images
    - Image observer active
    - Fetch interceptor active
    - All caches cleared
    `);
    
    // Return cleanup function
    return {
      observer,
      cleanup: () => {
        observer.disconnect();
        console.log('🧹 Cleanup completed');
      }
    };
  }
  
  /**
   * 6. Auto-execute and expose global functions
   */
  
  // Run immediately
  main().then(result => {
    // Store cleanup function globally
    window.cacheFixCleanup = result.cleanup;
    
    // Show success message
    console.log('🎉 Cache & URL fix tool ready!');
    console.log('To cleanup observers: window.cacheFixCleanup()');
  });
  
  // Expose functions globally for manual use
  window.fixCacheUrls = {
    fixImages: fixExistingImages,
    clearCache: clearAllCache,
    config: CONFIG,
    version: '1.0.0'
  };
  
  // Add CSS for any potential styling fixes
  const style = document.createElement('style');
  style.textContent = `
    /* Ensure images don't break during URL fixes */
    img[src*="localhost"] {
      opacity: 0.5;
      transition: opacity 0.3s ease;
    }
    
    img:not([src*="localhost"]) {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
  
})();

// Export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.fixCacheUrls;
} 