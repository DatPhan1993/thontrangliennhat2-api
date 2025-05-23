/**
 * Special handler for OPTIONS requests to properly handle CORS preflight requests
 * This handler will accept OPTIONS requests for any endpoint
 */
const optionsHandler = (req, res) => {
  // Define allowed origins
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];
  
  // Get the origin from the request headers
  const origin = req.headers.origin;
  
  // Set CORS headers based on the origin
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For requests without origin header or from non-allowed origins
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  }
  
  // Set comprehensive CORS headers for all requests
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization, Cache-Control, Pragma, Expires, X-Cache-Control, X-Timestamp, X-Nocache, X-CSRF-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
  
  // For OPTIONS requests, just return a 200 OK status with no content
  // This tells the browser the CORS preflight is successful
  res.status(200).end();
};

module.exports = optionsHandler; 