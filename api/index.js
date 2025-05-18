// Root API route handler
const { readDatabase } = require('../database-utils');

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Add cache control headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Get the database version or timestamp
  const db = readDatabase();
  const dbInfo = db.syncInfo || { lastSync: new Date().toISOString() };
  
  // Return basic API information
  res.json({
    name: "Thôn Trang Liên Nhật API",
    version: "1.0.0",
    status: "active",
    lastUpdated: dbInfo.lastSync,
    endpoints: {
      products: "/products",
      services: "/services",
      experiences: "/experiences",
      news: "/news"
    },
    documentation: "https://github.com/DatPhan1993/thontrangliennhat2-api",
    message: "Chào mừng đến với API của Thôn Trang Liên Nhật"
  });
}; 