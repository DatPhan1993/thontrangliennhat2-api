# Thôn Trang Liên Nhật API

A simple serverless API for Thôn Trang Liên Nhật website.

## Features

- Serverless API deployed to Vercel
- Simple JSON database
- Endpoints for products, services, experiences, and news

## Development

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

## Deployment

### Deploy to Vercel

1. Install Vercel CLI globally (if not already installed):
```bash
npm install -g vercel
```

2. Login to Vercel (if not already logged in):
```bash
vercel login
```

3. Deploy to production:
```bash
npm run deploy
```

Or deploy directly with Vercel CLI:
```bash
vercel --prod
```

### Environment Setup in Vercel Dashboard

In the Vercel dashboard under project settings > Build & Development Settings:

1. Build Command: Leave empty (uses package.json build script)
2. Output Directory: Leave empty
3. Install Command: `npm install`
4. Development Command: `npm run dev`

## API Endpoints

- `GET /` - API information
- `GET /products` - List all products
- `GET /services` - List all services
- `GET /experiences` - List all experiences
- `GET /news` - List all news
- `GET /database.json` - Get entire database

## Database Structure

The database is stored in `database.json` at the root of the project with the following structure:

```json
{
  "products": [],
  "services": [],
  "experiences": [],
  "news": [],
  "syncInfo": {
    "lastSync": "2023-05-19T10:34:00Z"
  }
}
``` 