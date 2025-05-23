# CORS Configuration for Thôn Trang Liên Nhật API

## Overview
This API server has been configured with comprehensive CORS (Cross-Origin Resource Sharing) settings to securely handle requests from the frontend application while maintaining security.

## Current Configuration

### Allowed Origins
- `http://localhost:3000` - React development server
- `http://127.0.0.1:3000` - Alternative localhost for React
- `http://localhost:3001` - API server itself
- `http://127.0.0.1:3001` - Alternative localhost for API
- `https://thontrangliennhat.com` - Production domain
- `https://www.thontrangliennhat.com` - Production domain with www
- `https://thontrangliennhat-api.vercel.app` - Vercel API domain
- `https://api.thontrangliennhat.com` - Custom API domain

### Allowed Methods
- GET
- POST
- PUT
- DELETE
- PATCH
- OPTIONS
- HEAD

### Allowed Headers
- Origin
- X-Requested-With
- Content-Type
- Accept
- Authorization
- Cache-Control
- Pragma
- Expires
- X-Cache-Control
- X-Timestamp
- X-Nocache
- X-Content-Type-Options
- X-Frame-Options

### Security Features
- **Credentials Support**: Enabled (`credentials: true`)
- **Preflight Caching**: 1 hour (`maxAge: 3600`)
- **Origin Validation**: Strict whitelist with logging of blocked origins
- **Security Headers**: 
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block

### Static Assets
Static assets (CSS, JS, images) are served with:
- `Access-Control-Allow-Origin: *` (public access)
- Long-term caching (1 year for static assets)

## Testing Endpoints

### Health Check
```bash
curl http://localhost:3001/api/health
```

### CORS Status Check
```bash
# With allowed origin
curl -H "Origin: http://localhost:3000" http://localhost:3001/api/cors-status

# With blocked origin (should fail)
curl -H "Origin: http://localhost:8080" http://localhost:3001/api/cors-status
```

## Production Deployment

When deploying to production, update the `allowedOrigins` array in `server-express.js`:

```javascript
const allowedOrigins = [
  'http://localhost:3000',      // Keep for development
  'http://127.0.0.1:3000',      
  'http://localhost:3001',      
  'http://127.0.0.1:3001',      
  'https://yourdomain.com',     // Add production domain
  'https://www.yourdomain.com'  // Add www variant
];
```

## Troubleshooting

### Common Issues
1. **CORS Error in Browser**: Check that the frontend origin is in the allowedOrigins list
2. **Preflight Failures**: Ensure all required headers are in allowedHeaders
3. **Credentials Issues**: Verify both server and client have credentials enabled

### Debug Commands
```bash
# Check server logs for CORS blocks
tail -f server.log | grep "CORS blocked"

# Test specific endpoint with origin
curl -H "Origin: http://localhost:3000" -v http://localhost:3001/api/products

# Check response headers
curl -I -H "Origin: http://localhost:3000" http://localhost:3001/api/health
```

## Dependencies
- `cors`: ^1.0.0 - Main CORS middleware
- `express`: ^4.18.2 - Web framework

## Files Modified
- `server-express.js` - Main server configuration
- `package.json` - Added cors dependency

## Monitoring
The server logs all requests with origin information:
```
[timestamp] METHOD /path - Origin: origin-url - User-Agent: client-info
```

Blocked CORS attempts are logged as warnings:
```
CORS blocked origin: http://unauthorized-domain.com
``` 