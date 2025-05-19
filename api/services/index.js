// Services API endpoint
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization, cache-control, pragma, expires');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET method for now
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Possible database locations
  const possiblePaths = [
    path.join(__dirname, '../../database.json'),
    path.join(__dirname, '../database.json'),
    path.join(__dirname, 'database.json'),
    path.join(process.cwd(), 'database.json'),
    path.join(process.cwd(), 'api/database.json')
  ];
  
  // Try to find and read the database
  let services = [];
  for (const dbPath of possiblePaths) {
    try {
      if (fs.existsSync(dbPath)) {
        console.log(`Found database at: ${dbPath}`);
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        
        if (data && data.services) {
          services = data.services;
          break;
        }
      }
    } catch (err) {
      console.error(`Error reading database at ${dbPath}: ${err.message}`);
    }
  }
  
  // Return services data
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json(services);
}; 