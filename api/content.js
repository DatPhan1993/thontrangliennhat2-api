/**
 * Combined API handler for all content types
 * (products, services, experiences, news)
 * This reduces the number of serverless functions needed
 */
const fs = require('fs');
const path = require('path');
const database = require('./database');

// CORS middleware
const corsMiddleware = (req, res) => {
  // Define allowed origins
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];
  
  // Get the origin from the request headers
  const origin = req.headers.origin;
  
  // Set CORS headers based on the origin
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For requests without origin header or from non-allowed origins
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  }
  
  // Set standard CORS headers for all requests
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization, Cache-Control, Pragma, Expires, X-Cache-Control, X-Timestamp, X-Nocache');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  res.setHeader('Vary', 'Origin');
  
  // For OPTIONS requests, just return a 200 status
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
};

// Helper to read database
const getDatabase = () => {
  const dbPath = path.resolve(__dirname, '..', 'database.json');
  console.log('Reading database from path:', dbPath);
  try {
    const rawData = fs.readFileSync(dbPath);
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading database:', error);
    return { products: [], services: [], experiences: [], news: [] };
  }
};

// Main handler function
module.exports = (req, res) => {
  // Apply CORS headers
  corsMiddleware(req, res);
  
  // Parse the path to determine content type and action
  const { url, method } = req;
  console.log(`API Request: ${method} ${url}`);
  
  // Extract content type and ID from URL
  // URL patterns: 
  // /content/products - list all products
  // /content/products/123 - get product with ID 123
  const parts = url.split('/').filter(p => p);
  
  if (parts.length < 2) {
    return res.status(400).json({
      statusCode: 400,
      message: 'Invalid URL format. Use /content/{type} or /content/{type}/{id}'
    });
  }
  
  const contentType = parts[1]; // products, services, experiences, or news
  const id = parts.length > 2 ? parseInt(parts[2], 10) : null;
  
  // Check if content type is valid
  if (!['products', 'services', 'experiences', 'news'].includes(contentType)) {
    return res.status(400).json({
      statusCode: 400,
      message: 'Invalid content type. Use products, services, experiences, or news'
    });
  }
  
  try {
    const db = getDatabase();
    
    // Handle listing all items of a type
    if (!id) {
      return res.status(200).json({
        statusCode: 200,
        message: 'Success',
        data: db[contentType] || []
      });
    }
    
    // Handle getting a specific item by ID
    const item = db[contentType].find(i => i.id === id);
    
    if (!item) {
      return res.status(404).json({
        statusCode: 404,
        message: `${contentType.slice(0, -1)} not found`
      });
    }
    
    return res.status(200).json({
      statusCode: 200,
      message: 'Success',
      data: item
    });
  } catch (error) {
    console.error(`Error handling ${contentType} request:`, error);
    return res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: error.message
    });
  }
}; 