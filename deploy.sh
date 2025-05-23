#!/bin/bash

# Deploy script for Thôn Trang Liên Nhật API

echo "🚀 Deploying API to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel:"
    vercel login
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run syntax check
echo "🔍 Checking syntax..."
if ! node -c server-express.js; then
    echo "❌ Syntax error found. Please fix before deploying."
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to production..."
vercel --prod

# Show deployment status
echo "✅ Deployment complete!"
echo ""
echo "🔗 Your API is available at:"
echo "   - Vercel URL: https://thontrangliennhat-api.vercel.app"
echo "   - Custom domain: https://api.thontrangliennhat.com (after DNS setup)"
echo ""
echo "🧪 Test your deployment:"
echo "   curl https://thontrangliennhat-api.vercel.app/api/health"
echo ""
echo "📊 Monitor your deployment:"
echo "   vercel logs --follow" 