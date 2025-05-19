/**
 * API CORS fix
 * This module adds proper CORS headers to all API responses
 * 
 * It will:
 * 1. Add proper CORS headers for all origins or specific known origins
 * 2. Handle CORS preflight requests
 * 3. Expose necessary headers for complex requests
 */

const corsMiddleware = require('./cors-middleware');

// Main handler function
module.exports = (req, res) => {
  // Start by applying CORS headers
  corsMiddleware(req, res);
  
  // Return a 200 OK response for preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({
      status: 'success',
      message: 'CORS preflight request successful'
    });
  }
  
  // For actual requests, return API status
  res.json({
    status: 'success',
    message: 'CORS headers successfully applied',
    origin: req.headers.origin || 'unknown',
    method: req.method,
    endpoints: {
      products: "/products",
      services: "/services", 
      experiences: "/experiences",
      news: "/news"
    }
  });
}; 