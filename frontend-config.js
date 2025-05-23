/**
 * 🌐 Frontend Configuration Helper
 * ===================================
 * 
 * Copy this file to your frontend project and import it to ensure
 * proper API configuration and localhost URL fixes.
 */

// 1. API Configuration
export const API_CONFIG = {
  // Production API endpoint
  PRODUCTION: 'https://api.thontrangliennhat.com',
  
  // Development API endpoint  
  DEVELOPMENT: 'http://localhost:3001',
  
  // Determine current environment
  get BASE_URL() {
    if (typeof window !== 'undefined') {
      // Browser environment
      const hostname = window.location.hostname;
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Local development - check if API is available
        return this.DEVELOPMENT;
      } else {
        // Production environment
        return this.PRODUCTION;
      }
    } else {
      // Node.js environment (SSR)
      return process.env.NODE_ENV === 'production' 
        ? this.PRODUCTION 
        : this.DEVELOPMENT;
    }
  },
  
  // API endpoints
  ENDPOINTS: {
    HEALTH: '/api/health',
    PRODUCTS: '/api/products',
    SERVICES: '/api/services', 
    TEAMS: '/api/teams',
    NEWS: '/api/news',
    IMAGES: '/api/images',
    VIDEOS: '/api/videos',
    EXPERIENCES: '/api/experiences',
    CONTACT: '/api/contact',
    NAVIGATION: '/api/parent-navs/all-with-child'
  }
};

// 2. HTTP Client with automatic URL fixing
export class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }
  
  // Fix localhost URLs automatically
  fixUrl(url) {
    if (typeof url === 'string' && url.includes('localhost:3001')) {
      return url.replace('http://localhost:3001', API_CONFIG.PRODUCTION);
    }
    return url;
  }
  
  // Fetch with automatic URL fixing and cache busting
  async fetch(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const cacheBuster = new Date().getTime();
    const separator = endpoint.includes('?') ? '&' : '?';
    const finalUrl = `${url}${separator}_=${cacheBuster}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      ...options
    };
    
    try {
      const response = await fetch(finalUrl, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Fix any localhost URLs in the response data
      return this.fixResponseUrls(data);
      
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }
  
  // Recursively fix localhost URLs in response data
  fixResponseUrls(obj) {
    if (typeof obj === 'string') {
      return this.fixUrl(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.fixResponseUrls(item));
    }
    
    if (obj && typeof obj === 'object') {
      const fixed = {};
      for (const [key, value] of Object.entries(obj)) {
        fixed[key] = this.fixResponseUrls(value);
      }
      return fixed;
    }
    
    return obj;
  }
  
  // Convenience methods for common endpoints
  async getProducts() {
    return this.fetch(API_CONFIG.ENDPOINTS.PRODUCTS);
  }
  
  async getServices() {
    return this.fetch(API_CONFIG.ENDPOINTS.SERVICES);
  }
  
  async getTeams() {
    return this.fetch(API_CONFIG.ENDPOINTS.TEAMS);
  }
  
  async getNews() {
    return this.fetch(API_CONFIG.ENDPOINTS.NEWS);
  }
  
  async getImages() {
    return this.fetch(API_CONFIG.ENDPOINTS.IMAGES);
  }
  
  async getVideos() {
    return this.fetch(API_CONFIG.ENDPOINTS.VIDEOS);
  }
  
  async getExperiences() {
    return this.fetch(API_CONFIG.ENDPOINTS.EXPERIENCES);
  }
  
  async getNavigation() {
    return this.fetch(API_CONFIG.ENDPOINTS.NAVIGATION);
  }
  
  async submitContact(data) {
    return this.fetch(API_CONFIG.ENDPOINTS.CONTACT, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

// 3. Image URL fixer utility
export const ImageUtils = {
  // Fix single image URL
  fixImageUrl(url) {
    if (!url) return '';
    
    if (typeof url === 'string' && url.includes('localhost:3001')) {
      return url.replace('http://localhost:3001', API_CONFIG.PRODUCTION);
    }
    
    // If URL is relative, make it absolute
    if (url.startsWith('/images/') || url.startsWith('/videos/')) {
      return `${API_CONFIG.BASE_URL}${url}`;
    }
    
    return url;
  },
  
  // Fix array of image URLs
  fixImageUrls(urls) {
    if (!Array.isArray(urls)) return [];
    return urls.map(url => this.fixImageUrl(url));
  },
  
  // Create responsive image srcset
  createSrcSet(baseUrl, sizes = [400, 800, 1200]) {
    const fixedUrl = this.fixImageUrl(baseUrl);
    return sizes.map(size => `${fixedUrl}?w=${size} ${size}w`).join(', ');
  }
};

// 4. Cache management utilities
export const CacheUtils = {
  // Clear all browser cache
  async clearAllCache() {
    try {
      // Clear Cache API
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('✅ Cleared Cache API');
      }
      
      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ Cleared localStorage and sessionStorage');
      
      // Clear service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }
        console.log('✅ Cleared service workers');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
      return false;
    }
  },
  
  // Force refresh with cache bypass
  hardRefresh() {
    window.location.reload(true);
  }
};

// 5. React hooks (if using React)
export const useApi = () => {
  const [apiClient] = useState(() => new ApiClient());
  return apiClient;
};

// 6. Default export
const api = new ApiClient();
export default api;

// 7. Environment detection
export const ENV = {
  isDevelopment: API_CONFIG.BASE_URL.includes('localhost'),
  isProduction: API_CONFIG.BASE_URL.includes('thontrangliennhat.com'),
  apiBaseUrl: API_CONFIG.BASE_URL
};

// 8. Quick setup function for immediate use
export const setupFrontend = () => {
  console.log('🚀 Frontend API Config loaded');
  console.log('📡 API Base URL:', API_CONFIG.BASE_URL);
  console.log('🌍 Environment:', ENV.isProduction ? 'Production' : 'Development');
  
  // Auto-fix any existing images
  document.querySelectorAll('img').forEach(img => {
    if (img.src.includes('localhost:3001')) {
      img.src = ImageUtils.fixImageUrl(img.src);
    }
  });
  
  return api;
};

// Auto-setup if in browser environment
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFrontend);
  } else {
    setupFrontend();
  }
} 