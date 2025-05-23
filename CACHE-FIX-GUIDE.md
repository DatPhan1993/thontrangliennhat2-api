# 🔧 Hướng dẫn Fix Lỗi Cache và Localhost URLs

## 🎯 Vấn đề hiện tại

Website `thontrangliennhat.com` vẫn đang cố gắng load hình ảnh từ `http://localhost:3001` thay vì `https://api.thontrangliennhat.com`.

## ✅ Các bước đã thực hiện

1. **✅ Database đã được sửa**: Tất cả URLs trong database.json đã được cập nhật
2. **✅ API Production hoạt động**: `https://api.thontrangliennhat.com` hoạt động bình thường
3. **✅ CORS đã được cấu hình đúng**: Hỗ trợ cross-origin requests
4. **✅ Cache-busting headers**: API responses có no-cache headers

## 🔍 Debug Tools

### 1. Test Page
Truy cập: `https://api.thontrangliennhat.com/test-api.html`

### 2. Debug Endpoint  
```bash
curl https://api.thontrangliennhat.com/api/debug/urls
```

## 🛠️ Các bước khắc phục cho Frontend

### 1. Kiểm tra Frontend Code
Tìm kiếm tất cả file trong frontend project:

```bash
# Tìm hard-coded localhost URLs
grep -r "localhost:3001" ./src/
grep -r "localhost:3001" ./public/
grep -r "localhost:3001" ./build/
```

### 2. Cập nhật Environment Variables
```javascript
// .env.production
REACT_APP_API_BASE_URL=https://api.thontrangliennhat.com

// .env.development  
REACT_APP_API_BASE_URL=http://localhost:3001
```

### 3. Config API Base URL
```javascript
// config/api.js
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_BASE_URL || 'https://api.thontrangliennhat.com'
  : 'http://localhost:3001';

export { API_BASE_URL };
```

### 4. Update Service Workers
```javascript
// Trong service worker hoặc cache logic
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}
```

### 5. Force Cache Clear trong Build
```javascript
// Thêm cache-busting parameter
const fetchWithNoCace = (url) => {
  const separator = url.includes('?') ? '&' : '?';
  return fetch(`${url}${separator}_=${Date.now()}`, {
    cache: 'no-cache'
  });
};
```

## 🌐 Browser Cache Clearing

### Chrome DevTools
1. Mở DevTools (F12)
2. Vào tab **Application**
3. Trong **Storage** → Clear storage
4. Check tất cả options và click **Clear site data**

### Firefox DevTools  
1. Mở DevTools (F12)
2. Vào tab **Storage**
3. Clear All Storage

### Manual Browser Cache
1. **Chrome**: Ctrl+Shift+Del → All time → Clear data
2. **Firefox**: Ctrl+Shift+Del → Everything → Clear Now
3. **Hard Refresh**: Ctrl+Shift+R hoặc Shift+F5

## 🔄 Deployment Fix

### Vercel/Netlify
```json
// vercel.json hoặc netlify.toml
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

### Build Process
```bash
# Clear build cache trước khi deploy
rm -rf build/ dist/ .next/
npm run build

# Hoặc force rebuild
npm run build -- --no-cache
```

## 🔧 Specific Fixes

### 1. React Applications
```javascript
// Thay thế tất cả hardcoded URLs
const ImageComponent = ({ src }) => {
  const imageUrl = src.replace('http://localhost:3001', 'https://api.thontrangliennhat.com');
  return <img src={imageUrl} alt="" />;
};
```

### 2. Vue.js Applications
```javascript
// filters/url.js
export const fixImageUrl = (url) => {
  if (typeof url === 'string') {
    return url.replace('http://localhost:3001', 'https://api.thontrangliennhat.com');
  }
  return url;
};
```

### 3. Vanilla JavaScript
```javascript
// Utility function
function fixImageUrl(url) {
  return url ? url.replace('http://localhost:3001', 'https://api.thontrangliennhat.com') : url;
}

// Update all images on page
document.querySelectorAll('img').forEach(img => {
  if (img.src.includes('localhost:3001')) {
    img.src = fixImageUrl(img.src);
  }
});
```

## 🚀 Quick Fix Script

```javascript
// Thêm vào HTML của frontend website
<script>
(function() {
  // Fix all existing images
  document.querySelectorAll('img').forEach(img => {
    if (img.src.includes('localhost:3001')) {
      img.src = img.src.replace('http://localhost:3001', 'https://api.thontrangliennhat.com');
    }
  });
  
  // Observer cho images mới được thêm
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // Element node
          const images = node.tagName === 'IMG' ? [node] : node.querySelectorAll('img');
          images.forEach(img => {
            if (img.src.includes('localhost:3001')) {
              img.src = img.src.replace('http://localhost:3001', 'https://api.thontrangliennhat.com');
            }
          });
        }
      });
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
})();
</script>
```

## 📞 Verification

### Test API Endpoints
```bash
# Health check
curl https://api.thontrangliennhat.com/api/health

# Images with production URLs
curl https://api.thontrangliennhat.com/api/images

# News with production URLs  
curl https://api.thontrangliennhat.com/api/news
```

### Browser Console Test
```javascript
// Test trong browser console của thontrangliennhat.com
fetch('https://api.thontrangliennhat.com/api/images')
  .then(res => res.json())
  .then(data => {
    console.log('Images from API:', data.data);
    data.data.forEach(img => {
      if (img.url.includes('localhost')) {
        console.error('FOUND LOCALHOST URL:', img.url);
      } else {
        console.log('✅ Good URL:', img.url);
      }
    });
  });
```

## 🎯 Immediate Action Items

1. **Clear Browser Cache** hoàn toàn
2. **Check Frontend Build** có hard-coded URLs không
3. **Update Environment Variables** nếu có
4. **Deploy Frontend** với config mới
5. **Test với Incognito Mode** để bypass cache

## 📱 Contact & Support

- **API Status**: https://api.thontrangliennhat.com/api/health
- **Debug Tool**: https://api.thontrangliennhat.com/test-api.html
- **Debug Endpoint**: https://api.thontrangliennhat.com/api/debug/urls 