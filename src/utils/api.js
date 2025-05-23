// API Configuration
const API_CONFIG = {
  DEVELOPMENT: 'http://localhost:3001',
  PRODUCTION: 'https://api.thontrangliennhat.com',
  get BASE_URL() {
    // Always use production for deployed frontend
    return this.PRODUCTION;
  },
  ENDPOINTS: {
    PRODUCTS: '/api/products',
    SERVICES: '/api/services', 
    NEWS: '/api/news',
    TEAMS: '/api/teams',
    EXPERIENCES: '/api/experiences'
  }
};

// URL fixing utilities
function fixUrl(url) {
  if (!url) return '';
  
  // Fix localhost URLs
  if (typeof url === 'string' && url.includes('localhost:3001')) {
    return url.replace('http://localhost:3001', API_CONFIG.PRODUCTION);
  }
  
  return url;
}

// Image URL fixer utility
export const ImageUtils = {
  fixImageUrl(url) {
    if (!url) return '';
    
    console.log(`[ImageUtils] Processing URL: ${url}`);
    
    // Fix localhost URLs first
    if (typeof url === 'string' && url.includes('localhost:3001')) {
      const fixed = url.replace('http://localhost:3001', API_CONFIG.PRODUCTION);
      console.log(`[ImageUtils] Fixed localhost URL: ${url} -> ${fixed}`);
      return fixed;
    }
    
    // If URL is relative with leading slash, make it absolute
    if (url.startsWith('/images/') || url.startsWith('/videos/')) {
      const fixed = `${API_CONFIG.BASE_URL}${url}`;
      console.log(`[ImageUtils] Fixed relative URL with slash: ${url} -> ${fixed}`);
      return fixed;
    }
    
    // If URL is relative without leading slash, make it absolute  
    if (url.startsWith('images/') || url.startsWith('videos/')) {
      const fixed = `${API_CONFIG.BASE_URL}/${url}`;
      console.log(`[ImageUtils] Fixed relative URL without slash: ${url} -> ${fixed}`);
      return fixed;
    }
    
    // If already absolute URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log(`[ImageUtils] URL already absolute: ${url}`);
      return url;
    }
    
    console.log(`[ImageUtils] URL unchanged: ${url}`);
    return url;
  },
  
  fixImageUrls(urls) {
    if (!Array.isArray(urls)) return [];
    return urls.map(url => this.fixImageUrl(url));
  }
}; 