// Root API route handler
const fs = require('fs');
const path = require('path');
const corsMiddleware = require('./cors-middleware');

module.exports = (req, res) => {
  // Apply CORS middleware
  corsMiddleware(req, res);
  
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