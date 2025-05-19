/**
 * Handler for team-related API endpoints
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
    return { team: [] };
  }
};

// Helper to write database
const writeDatabase = (db) => {
  try {
    const dbPath = path.resolve(__dirname, '..', 'database.json');
    console.log('Writing database to path:', dbPath);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
};

// Main handler function
module.exports = (req, res) => {
  // Apply CORS headers
  corsMiddleware(req, res);
  
  // Parse the path and method
  const { url, method } = req;
  console.log(`Team API Request: ${method} ${url}`);
  
  // Get the path parts
  const parts = url.split('/').filter(p => p);
  
  try {
    const db = getDatabase();
    
    // Ensure team array exists
    if (!db.team) {
      db.team = [];
    }
    
    // GET /teams - List all team members
    if (method === 'GET' && (parts.length === 1 || parts.length === 2 && parts[1] === '')) {
      return res.status(200).json({
        statusCode: 200,
        message: 'Success',
        data: db.team
      });
    }
    
    // GET /teams/:id - Get team member by ID
    if (method === 'GET' && parts.length === 2 && !isNaN(parseInt(parts[1]))) {
      const id = parseInt(parts[1]);
      const member = db.team.find(m => m.id === id);
      
      if (!member) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Team member not found'
        });
      }
      
      return res.status(200).json({
        statusCode: 200,
        message: 'Success',
        data: member
      });
    }
    
    // All other methods (POST, PATCH, DELETE) are not implemented in this consolidated handler
    // as they would require file upload handling which is complex.
    // For now, we'll return method not allowed
    return res.status(405).json({
      statusCode: 405,
      message: 'Method not allowed for teams API in consolidated handler'
    });
  } catch (error) {
    console.error('Error handling team request:', error);
    return res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: error.message
    });
  }
}; 