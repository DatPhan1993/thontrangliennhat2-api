// Root API route handler
const { readDatabase } = require('../database-utils');

module.exports = (req, res) => {
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