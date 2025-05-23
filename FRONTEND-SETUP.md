# 🚀 Frontend Setup Guide - Thôn Trang Liên Nhật

## 📁 Project Structure
```
/Users/admin/thontrangliennhat2-frontend/
├── src/
│   ├── utils/
│   │   └── api.js          (Copy frontend-config.js here)
│   ├── components/
│   ├── pages/
│   └── App.js
├── public/
│   └── index.html
├── .env
└── package.json
```

## 🛠️ Quick Setup Steps

### 1. Copy API Configuration
Copy `frontend-config.js` to your frontend project:
```bash
cp frontend-config.js /Users/admin/thontrangliennhat2-frontend/src/utils/api.js
```

### 2. Create Environment File
Create `/Users/admin/thontrangliennhat2-frontend/.env`:
```env
REACT_APP_API_BASE_URL=https://api.thontrangliennhat.com
REACT_APP_NODE_ENV=production
GENERATE_SOURCEMAP=false
```

### 3. Update Your Components

#### Option A: Use ApiClient (Recommended)
```javascript
// In your React components
import api from './utils/api';

function ProductsList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.getProducts()
      .then(response => setProducts(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <img src={api.fixUrl(product.image)} alt={product.name} />
        </div>
      ))}
    </div>
  );
}
```

#### Option B: Use Environment Variables
```javascript
// In your fetch calls
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

fetch(`${API_BASE}/api/products`)
  .then(response => response.json())
  .then(data => setProducts(data.data));
```

### 4. Add Fix Tools to HTML

#### Method 1: Add to public/index.html
```html
<!DOCTYPE html>
<html>
<head>
  <title>Thôn Trang Liên Nhật</title>
  <!-- Fix tools -->
  <script src="https://api.thontrangliennhat.com/fix-cache.js"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

#### Method 2: Conditional loading in App.js
```javascript
// In App.js
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Load fix tools only in production or when needed
    if (process.env.NODE_ENV === 'production') {
      const script = document.createElement('script');
      script.src = 'https://api.thontrangliennhat.com/fix-cache.js';
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="App">
      {/* Your app content */}
    </div>
  );
}
```

## 🔧 Available Fix Tools

### 1. Automatic Fix Script
- **URL**: https://api.thontrangliennhat.com/fix-cache.js
- **Function**: Auto-fixes localhost URLs and clears cache
- **Usage**: Include in HTML or load dynamically

### 2. Fix Guide UI
- **URL**: https://api.thontrangliennhat.com/fix-guide.html
- **Function**: Interactive guide for manual fixes
- **Usage**: Direct users here when they have cache issues

### 3. API Debug Endpoint
- **URL**: https://api.thontrangliennhat.com/api/debug/urls
- **Function**: Check for localhost URLs in database
- **Usage**: Debugging and monitoring

## 🌍 Environment Detection

The config automatically detects environment:
- **localhost/127.0.0.1** → Development API (localhost:3001)
- **Production domain** → Production API (api.thontrangliennhat.com)

## 📋 Common Usage Patterns

### Image Components
```javascript
import { ImageUtils } from './utils/api';

function ProductImage({ src, alt }) {
  return (
    <img 
      src={ImageUtils.fixImageUrl(src)} 
      alt={alt}
      onError={(e) => {
        e.target.src = '/placeholder.jpg';
      }}
    />
  );
}
```

### API Calls with Error Handling
```javascript
import api from './utils/api';

async function fetchData() {
  try {
    const [products, services, teams] = await Promise.all([
      api.getProducts(),
      api.getServices(),
      api.getTeams()
    ]);
    
    return {
      products: products.data,
      services: services.data,
      teams: teams.data
    };
  } catch (error) {
    console.error('API Error:', error);
    // Handle error appropriately
    return { products: [], services: [], teams: [] };
  }
}
```

### Cache Management
```javascript
import { CacheUtils } from './utils/api';

// Clear cache button
function ClearCacheButton() {
  const handleClearCache = async () => {
    const success = await CacheUtils.clearAllCache();
    if (success) {
      alert('Cache cleared successfully!');
      window.location.reload();
    }
  };

  return (
    <button onClick={handleClearCache}>
      Clear Cache & Refresh
    </button>
  );
}
```

## 🚨 Troubleshooting

### Issue: Images still showing localhost URLs
**Solution**: 
1. Visit: https://api.thontrangliennhat.com/fix-guide.html
2. Click "🚀 Chạy Quick Fix"
3. Or add fix script to your HTML

### Issue: API calls failing
**Solution**: 
1. Check console for CORS errors
2. Verify API_BASE_URL in .env
3. Test API: https://api.thontrangliennhat.com/api/health

### Issue: Cache problems
**Solution**: 
1. Use the CacheUtils.clearAllCache() function
2. Hard refresh: Ctrl+Shift+R
3. Use incognito mode for testing

## 📊 Monitoring & Debug

### Check API Status
```javascript
api.fetch('/api/health').then(response => {
  console.log('API Status:', response);
});
```

### Check for localhost URLs
```javascript
api.fetch('/api/debug/urls').then(response => {
  console.log('Localhost URLs found:', response.data.localhostUrlsFound);
});
```

## 🎯 Best Practices

1. **Always use the ApiClient** for API calls
2. **Include fix tools** in production builds
3. **Test in incognito mode** to verify fixes
4. **Monitor console** for URL fix logs
5. **Use environment variables** for different deployments

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Visit the fix guide: https://api.thontrangliennhat.com/fix-guide.html  
3. Test API health: https://api.thontrangliennhat.com/api/health

---

## 🚀 Quick Start Command

Copy this to your frontend project and you're ready to go:

```bash
# Navigate to frontend project
cd /Users/admin/thontrangliennhat2-frontend

# Copy API config
curl -o src/utils/api.js https://raw.githubusercontent.com/DatPhan1993/thontrangliennhat2-api/main/frontend-config.js

# Create .env file
echo "REACT_APP_API_BASE_URL=https://api.thontrangliennhat.com" > .env
echo "REACT_APP_NODE_ENV=production" >> .env

# Install and start
npm install
npm start
```

🎉 **That's it! Your frontend is now configured to work perfectly with the API and automatically fix any cache/URL issues.** 