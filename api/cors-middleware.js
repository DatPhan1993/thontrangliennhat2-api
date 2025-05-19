/**
 * CORS Middleware for API endpoints 
 * This middleware adds appropriate CORS headers and handles OPTIONS requests
 */

module.exports = function corsMiddleware(req, res, next) {
  // Define allowed origins
  const allowedOrigins = [
    'https://thontrangliennhat.com',
    'https://www.thontrangliennhat.com',
    'http://thontrangliennhat.com',
    'http://www.thontrangliennhat.com',
    'https://thontrangliennhat2-frontend.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ];
  
  // Get the origin from the request headers
  const origin = req.headers.origin;
  
  // Set CORS headers based on the origin
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Allow any origin as a fallback
    res.setHeader('Access-Control-Allow-Origin', '*');
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
  
  // Continue to the next middleware/route handler
  if (next) {
    next();
  }
}; 