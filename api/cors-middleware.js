/**
 * CORS Middleware for API endpoints 
 * This middleware adds appropriate CORS headers and handles OPTIONS requests
 */

module.exports = function corsMiddleware(req, res, next) {
  // Define allowed origins
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];
  
  // Special handling for stylesheet files - allow from any origin
  if (req.path.endsWith('.css') || req.path.endsWith('.js') || req.path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    // Get the origin from the request headers
    const origin = req.headers.origin;
    
    // Set CORS headers based on the origin
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      // Allow any origin as a fallback
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    }
  }
  
  // Set standard CORS headers for all requests
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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