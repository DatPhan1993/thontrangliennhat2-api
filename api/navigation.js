/**
 * Combined API handler for all navigation-related requests
 * Handles parent navs, child navs, and navigation structures
 */
const fs = require('fs');
const path = require('path');

// CORS middleware
const corsMiddleware = (req, res) => {
  // Define allowed origins
  const allowedOrigins = [
    'https://thontrangliennhat.com',
    'http://thontrangliennhat.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ];
  
  // Get the origin from the request headers
  const origin = req.headers.origin;
  
  // Set CORS headers based on the origin
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For requests without origin header or from non-allowed origins
    res.setHeader('Access-Control-Allow-Origin', 'https://thontrangliennhat.com');
  }
  
  // Set standard CORS headers for all requests
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
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
    return { navigation: [] };
  }
};

// Main handler function
module.exports = (req, res) => {
  // Apply CORS headers
  corsMiddleware(req, res);
  
  // Parse the path to determine the action
  const { url, method } = req;
  console.log(`Navigation API Request: ${method} ${url}`);
  
  // Extract parts from URL
  // URL patterns:
  // /navigation - get all navigation
  // /navigation/parent-navs - get all parent navs
  // /navigation/parent-navs/123 - get parent nav with ID 123
  // /navigation/parent-navs/slug/dich-vu - get parent nav by slug
  // /navigation/child-navs - get all child navs
  // /navigation/child-navs/123 - get child nav with ID 123
  const parts = url.split('/').filter(p => p);
  
  try {
    const db = getDatabase();
    
    // Default case: return all navigation
    if (parts.length === 1) {
      return res.status(200).json({
        statusCode: 200,
        message: 'Success',
        data: db.navigation || []
      });
    }
    
    // Handle parent-navs requests
    if (parts.length >= 2 && parts[1] === 'parent-navs') {
      // Get all parent navs
      if (parts.length === 2) {
        const parentNavs = db.navigation.map(item => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          position: item.position
        }));
        
        return res.status(200).json({
          statusCode: 200,
          message: 'Success',
          data: parentNavs
        });
      }
      
      // Get parent nav by ID
      if (parts.length === 3 && !isNaN(parseInt(parts[2]))) {
        const id = parseInt(parts[2]);
        const parent = db.navigation.find(nav => nav.id === id);
        
        if (!parent) {
          return res.status(404).json({
            statusCode: 404,
            message: 'Parent navigation not found'
          });
        }
        
        return res.status(200).json({
          statusCode: 200,
          message: 'Parent navigation fetched successfully',
          data: parent
        });
      }
      
      // Get parent nav by slug
      if (parts.length === 4 && parts[2] === 'slug') {
        const slug = parts[3];
        const parent = db.navigation.find(nav => nav.slug === slug);
        
        if (!parent) {
          return res.status(404).json({
            statusCode: 404,
            message: 'Parent navigation not found'
          });
        }
        
        return res.status(200).json({
          statusCode: 200,
          message: 'Success',
          data: parent.children
        });
      }
    }
    
    // Handle child-navs requests
    if (parts.length >= 2 && parts[1] === 'child-navs') {
      // Get all child navs
      if (parts.length === 2) {
        let allChildren = [];
        
        db.navigation.forEach(parent => {
          allChildren = [...allChildren, ...parent.children.map(child => ({
            ...child,
            parentId: parent.id
          }))];
        });
        
        return res.status(200).json({
          statusCode: 200,
          message: 'Success',
          data: allChildren
        });
      }
      
      // Get child nav by ID
      if (parts.length === 3 && !isNaN(parseInt(parts[2]))) {
        const id = parseInt(parts[2]);
        let childNav = null;
        
        // Find the child navigation item
        for (const parent of db.navigation) {
          const child = parent.children.find(child => child.id === id);
          
          if (child) {
            childNav = { ...child, parentId: parent.id };
            break;
          }
        }
        
        if (!childNav) {
          return res.status(404).json({
            statusCode: 404,
            message: 'Child navigation not found'
          });
        }
        
        return res.status(200).json({
          statusCode: 200,
          message: 'Child navigation fetched successfully',
          data: childNav
        });
      }
    }
    
    // Handle navigation-links - alias for /navigation
    if (parts.length === 2 && parts[1] === 'navigation-links') {
      return res.status(200).json({
        statusCode: 200,
        message: 'Success',
        data: db.navigation || []
      });
    }
    
    // Handle all-with-child - get all parent navs with children
    if (parts.length === 3 && parts[1] === 'parent-navs' && parts[2] === 'all-with-child') {
      return res.status(200).json({
        statusCode: 200,
        message: 'Success',
        data: db.navigation
      });
    }
    
    // Default: return 404 for unsupported paths
    return res.status(404).json({
      statusCode: 404,
      message: 'Navigation endpoint not found'
    });
  } catch (error) {
    console.error('Error handling navigation request:', error);
    return res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: error.message
    });
  }
}; 