# Thôn Trang Liên Nhật API

API server cho website Thôn Trang Liên Nhật được xây dựng với Express.js và có thể deploy trên Vercel.

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Deployment
```bash
# Deploy to Vercel
npm run deploy

# Or use the deployment script
./deploy.sh
```

## 🌐 API Endpoints

### Core Endpoints
- `GET /api/health` - Health check
- `GET /api/cors-status` - CORS configuration status

### Content Endpoints
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/services` - Danh sách dịch vụ
- `GET /api/teams` - Thông tin đội ngũ
- `GET /api/news` - Tin tức
- `GET /api/images` - Hình ảnh
- `GET /api/videos` - Video
- `GET /api/experiences` - Trải nghiệm

### Contact
- `GET /api/contact` - Lấy danh sách tin nhắn
- `POST /api/contact` - Gửi tin nhắn mới
- `DELETE /api/contact/:id` - Xóa tin nhắn

## 🔧 Configuration

### Environment Variables
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3001)
- `VERCEL` - Set by Vercel platform

### CORS Configuration
API được cấu hình để chấp nhận requests từ:
- `http://localhost:3000` - React development server
- `https://thontrangliennhat.com` - Production domain
- `https://www.thontrangliennhat.com` - Production domain with www
- `https://thontrangliennhat-api.vercel.app` - Vercel API domain
- `https://api.thontrangliennhat.com` - Custom API domain

## 📁 Project Structure

```
thontrangliennhat2-api/
├── server-express.js    # Main server file
├── vercel.json         # Vercel configuration
├── package.json        # Dependencies and scripts
├── deploy.sh           # Deployment script
├── api/               # Database files
├── images/            # Static image assets
├── videos/            # Static video assets
├── public/            # Static public assets
├── CORS-CONFIG.md     # CORS documentation
├── DEPLOYMENT.md      # Deployment guide
└── README.md          # This file
```

## 🚀 Deployment

### Vercel Platform
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `npm run deploy` or `./deploy.sh`

### Custom Domain Setup
1. Add domain in Vercel Dashboard
2. Configure DNS records
3. Domain: `api.thontrangliennhat.com`

## 🧪 Testing

### Local Testing
```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test CORS
curl -H "Origin: https://thontrangliennhat.com" \
     http://localhost:3001/api/cors-status
```

### Production Testing
```bash
# Test deployed API
curl https://thontrangliennhat-api.vercel.app/api/health

# Test custom domain (after DNS setup)
curl https://api.thontrangliennhat.com/api/health
```

## 📊 Monitoring

### Vercel Dashboard
- View deployment logs
- Monitor function performance
- Check error rates

### Debug Commands
```bash
# View logs
vercel logs

# Follow logs in real-time
vercel logs --follow
```

## 🔒 Security Features

- ✅ CORS properly configured
- ✅ Security headers enabled
- ✅ File upload limits set
- ✅ Origin validation implemented
- ✅ Request logging enabled

## 📝 Documentation

- [CORS Configuration](./CORS-CONFIG.md)
- [Deployment Guide](./DEPLOYMENT.md)

## 🛠️ Development

### Adding New Endpoints
1. Add route in `server-express.js`
2. Update CORS if needed
3. Test locally
4. Deploy to Vercel

### Database
- JSON-based database in `api/database.json`
- For production, consider external database

## 📞 Support

For issues or questions, check the documentation files or review the server logs. 