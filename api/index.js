// Root API route handler
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // Set comprehensive CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization, Cache-Control, Pragma, Expires, X-Cache-Control, X-Timestamp, X-Nocache');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Add cache control headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Try to get database info
  let dbInfo = { lastSync: new Date().toISOString() };
  try {
    const possiblePaths = [
      path.join(__dirname, '../database.json'),
      path.join(__dirname, 'database.json'),
      path.join(process.cwd(), 'database.json')
    ];
    
    // Find database file
    let dbPath = null;
    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        dbPath = path;
        break;
      }
    }
    
    if (dbPath) {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      if (db.syncInfo) {
        dbInfo = db.syncInfo;
      }
    }
  } catch (err) {
    console.error('Error reading database:', err);
  }
  
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
      news: "/news",
      database: "/database.json"
    },
    documentation: "https://github.com/DatPhan1993/thontrangliennhat2-api",
    message: "Chào mừng đến với API của Thôn Trang Liên Nhật"
  });
}; 