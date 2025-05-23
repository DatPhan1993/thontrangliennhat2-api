/**
 * API endpoint to serve the database file directly
 */
const { readDatabase } = require('../database-utils');

// Set CORS headers
const setCorsHeaders = (req, res) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000' 
  ];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization, Cache-Control, Pragma, Expires, X-Cache-Control, X-Timestamp, X-Nocache');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
};

module.exports = (req, res) => {
  // Set CORS headers
  setCorsHeaders(req, res);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Database API endpoint accessed');
  
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Get database content using utility function
  const database = readDatabase();
  
  // Set content type and serve the database
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json(database);
}; 