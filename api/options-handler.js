/**
 * Special handler for OPTIONS requests to properly handle CORS preflight requests
 */
module.exports = (req, res) => {
  // Always set permissive CORS headers for OPTIONS requests
  res.setHeader('Access-Control-Allow-Origin', 'https://thontrangliennhat.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization, Cache-Control, Pragma, Expires, X-Cache-Control, X-Timestamp, X-Nocache');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
  
  // For OPTIONS requests, just return a 200 OK status with no content
  // This tells the browser the CORS preflight is successful
  res.status(200).end();
}; 