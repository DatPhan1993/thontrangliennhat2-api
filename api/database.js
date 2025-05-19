/**
 * API endpoint to serve the database file directly
 */
const { readDatabase } = require('../database-utils');

module.exports = (req, res) => {
  console.log('Database API endpoint accessed');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Origin,Authorization,cache-control,pragma,expires');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
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