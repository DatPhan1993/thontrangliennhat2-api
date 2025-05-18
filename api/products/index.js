const { readDatabase } = require('../../database-utils');
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  console.log('Products API endpoint accessed');
  
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Add cache control headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  try {
    // Attempt to read the database
    const db = readDatabase();
    
    // Check if db is null or undefined
    if (!db) {
      console.error('Database could not be read or is null');
      return res.status(500).json({
        statusCode: 500,
        message: 'Error reading database',
        data: []
      });
    }
    
    // Manually check for database.json in various locations for debugging
    const dbLocations = [
      path.join(__dirname, '../../database.json'),
      path.join(__dirname, '../database.json'),
      '/var/task/database.json',
      '/var/task/api/database.json'
    ];
    
    let debugInfo = [];
    for (const location of dbLocations) {
      try {
        const exists = fs.existsSync(location);
        const stats = exists ? fs.statSync(location) : null;
        debugInfo.push({
          path: location,
          exists,
          size: stats ? stats.size : 0
        });
      } catch (err) {
        debugInfo.push({
          path: location,
          exists: false,
          error: err.message
        });
      }
    }
    
    // Get products array or empty array if not found
    const products = db.products || [];
    console.log(`Found ${products.length} products in database`);
    
    // Return products with debug info
    // Check if products array is empty
    if (!products || products.length === 0) {
      console.warn('Products array is empty or null');
      
      // Create a fallback product if none exist
      const fallbackProducts = [
        {
          id: 999,
          name: 'Sản phẩm mẫu',
          description: 'Đây là sản phẩm mẫu được tạo ra vì không tìm thấy sản phẩm nào trong cơ sở dữ liệu',
          images: ['/images/placeholder.jpg'],
          price: 100000,
          createdAt: new Date().toISOString()
        }
      ];
      
      return res.status(200).json({
        statusCode: 200,
        message: 'Warning: No products found in database. Returning fallback data.',
        data: fallbackProducts,
        isFallback: true,
        debug: {
          timestamp: new Date().toISOString(),
          dbLocations: debugInfo,
          env: process.env.NODE_ENV
        }
      });
    }
    
    return res.status(200).json({
      statusCode: 200,
      message: 'Success',
      data: products,
      debug: {
        timestamp: new Date().toISOString(),
        dbLocations: debugInfo,
        env: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('Error in products API:', error);
    return res.status(500).json({
      statusCode: 500,
      message: `Server error: ${error.message}`,
      data: [],
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 