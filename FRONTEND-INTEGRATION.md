# Hướng dẫn Tích hợp Frontend với API Thôn Trang Liên Nhật

## URLs API Production

### Base URL
```
https://api.thontrangliennhat.com
```

### Các Endpoint Chính

#### 1. Sản phẩm nông nghiệp
```
GET https://api.thontrangliennhat.com/api/products
```

#### 2. Dịch vụ du lịch
```
GET https://api.thontrangliennhat.com/api/services
```

#### 3. Tin tức
```
GET https://api.thontrangliennhat.com/api/news
```

#### 4. Đội ngũ
```
GET https://api.thontrangliennhat.com/api/teams
```

#### 5. Hình ảnh
```
GET https://api.thontrangliennhat.com/api/images
```

#### 6. Video
```
GET https://api.thontrangliennhat.com/api/videos
```

#### 7. Kiểm tra health
```
GET https://api.thontrangliennhat.com/api/health
```

## Cấu hình cho Frontend Applications

### React.js
```javascript
// config/api.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.thontrangliennhat.com'
  : 'http://localhost:3001';

export { API_BASE_URL };

// services/api.js
import { API_BASE_URL } from '../config/api';

export const fetchProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  return response.json();
};

export const fetchServices = async () => {
  const response = await fetch(`${API_BASE_URL}/api/services`);
  return response.json();
};
```

### Vue.js
```javascript
// config/api.js
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.thontrangliennhat.com'
  : 'http://localhost:3001';

// services/ApiService.js
import { API_BASE_URL } from '@/config/api';

class ApiService {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return response.json();
  }

  async getProducts() {
    return this.get('/api/products');
  }

  async getServices() {
    return this.get('/api/services');
  }
}

export default new ApiService();
```

### Vanilla JavaScript
```javascript
// js/config.js
const API_BASE_URL = 'https://api.thontrangliennhat.com';

// js/api.js
async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Sử dụng
fetchData('/api/products').then(data => {
  console.log('Products:', data);
});
```

## CORS Support

API đã được cấu hình CORS để hỗ trợ:
- ✅ `localhost:3000` (React development)
- ✅ `localhost:3001` (API local)
- ✅ `https://thontrangliennhat.com`
- ✅ `https://www.thontrangliennhat.com`
- ✅ `https://api.thontrangliennhat.com`

## Xử lý Hình ảnh

Tất cả URLs hình ảnh từ API đã được cập nhật để sử dụng production URL:

```javascript
// Trước đây (lỗi)
"url": "http://localhost:3001/images/uploads/1746455326018-497167650.jpg"

// Hiện tại (đã sửa)
"url": "https://api.thontrangliennhat.com/images/uploads/1746455326018-497167650.jpg"
```

## Ví dụ Response Data

### Products Response
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "Gạo hữu cơ Liên Nhật",
      "price": 150000,
      "description": "Gạo hữu cơ được trồng theo phương pháp tự nhiên...",
      "images": ["/images/uploads/rice-organic.jpg"],
      "categoryId": 1
    }
  ]
}
```

### Images Response
```json
{
  "statusCode": 200,
  "message": "Success", 
  "data": [
    {
      "id": 7,
      "url": "https://api.thontrangliennhat.com/images/uploads/1746455326018-497167650.jpg",
      "name": "experience2.jpg",
      "description": "Hình ảnh tải lên: experience2.jpg",
      "createdAt": "2025-05-05T14:28:46.036Z"
    }
  ]
}
```

## Testing

### Kiểm tra API hoạt động
```bash
# Health check
curl https://api.thontrangliennhat.com/api/health

# Test products
curl https://api.thontrangliennhat.com/api/products

# Test images 
curl https://api.thontrangliennhat.com/api/images
```

### Kiểm tra CORS
```javascript
fetch('https://api.thontrangliennhat.com/api/health')
  .then(response => response.json())
  .then(data => console.log('API OK:', data))
  .catch(error => console.error('CORS Error:', error));
```

## Deployment Notes

1. **Cache Headers**: Static files được cache 1 năm
2. **Security Headers**: CSP, CORS, XSS Protection đã được cấu hình
3. **Image Optimization**: Hình ảnh được serve với proper content-type
4. **Font Support**: Font files được hỗ trợ với CORS phù hợp

## Support

Nếu gặp vấn đề khi tích hợp:
1. Kiểm tra CORS policy trong browser console
2. Verify API endpoints với curl/Postman
3. Đảm bảo sử dụng HTTPS cho production 