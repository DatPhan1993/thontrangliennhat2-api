# Deployment Guide - Thôn Trang Liên Nhật API

## Vercel Deployment

### Prerequisites
1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`

### Deployment Steps

#### 1. First Time Setup
```bash
cd thontrangliennhat2-api
vercel
```

Follow the prompts:
- Set up and deploy? → Yes
- Which scope? → Your personal account or team
- Link to existing project? → No
- Project name → thontrangliennhat-api
- Directory → ./
- Want to override settings? → No

#### 2. Subsequent Deployments
```bash
# Preview deployment
npm run deploy-preview

# Production deployment
npm run deploy
```

### Environment Configuration

#### Production Environment Variables
Set these in Vercel dashboard or using CLI:

```bash
vercel env add NODE_ENV production
```

#### Custom Domain Setup
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add custom domain: `api.thontrangliennhat.com`
3. Configure DNS records as instructed by Vercel

### Expected Deployment URLs
- Vercel subdomain: `https://thontrangliennhat-api.vercel.app`
- Custom domain: `https://api.thontrangliennhat.com`

### API Configuration After Deployment

#### 1. Update Frontend Configuration
Update frontend `src/config/index.js`:

```javascript
const config = {
  // Production API URL
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.thontrangliennhat.com' 
    : 'http://localhost:3001',
  // ... other config
};
```

#### 2. Update API Client
Update `src/services/apiClient.js`:

```javascript
const apiClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://api.thontrangliennhat.com/api'
    : 'http://localhost:3001/api',
  // ... other config
});
```

### CORS Configuration
The API is configured to accept requests from:
- `https://thontrangliennhat.com`
- `https://www.thontrangliennhat.com`
- `https://thontrangliennhat-api.vercel.app`
- `https://api.thontrangliennhat.com`
- Local development origins

### Testing Deployment

#### Health Check
```bash
curl https://api.thontrangliennhat.com/api/health
```

#### CORS Test
```bash
curl -H "Origin: https://thontrangliennhat.com" \
     https://api.thontrangliennhat.com/api/cors-status
```

### File Structure for Deployment
```
thontrangliennhat2-api/
├── server-express.js    # Main server file
├── vercel.json         # Vercel configuration
├── package.json        # Dependencies and scripts
├── api/               # Database files
├── images/            # Static image assets
├── videos/            # Static video assets
└── public/            # Static public assets
```

### Troubleshooting

#### Common Issues
1. **Function timeout**: Increase `maxDuration` in `vercel.json`
2. **File size limits**: Optimize images and assets
3. **CORS errors**: Check allowed origins in server configuration

#### Debug Commands
```bash
# Check deployment logs
vercel logs

# Check function logs
vercel logs --follow

# Test local production build
NODE_ENV=production node server-express.js
```

### Performance Optimization
1. **Static Assets**: Consider using Vercel's static file serving
2. **Database**: For production, consider external database
3. **Caching**: Implement appropriate cache headers
4. **CDN**: Use Vercel's global CDN for static assets

### Security Checklist
- ✅ CORS properly configured
- ✅ Security headers enabled
- ✅ File upload limits set
- ✅ Environment variables secured
- ✅ Origin validation implemented

### Monitoring
- Monitor via Vercel Dashboard
- Set up alerts for function errors
- Track API usage and performance 