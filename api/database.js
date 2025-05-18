const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Try to find database.json in various locations
    const dbPaths = [
      path.join(__dirname, '..', 'database.json'),
      path.join(__dirname, '..', '..', 'database.json')
    ];
    
    let dbContent = null;
    
    for (const dbPath of dbPaths) {
      if (fs.existsSync(dbPath)) {
        dbContent = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        break;
      }
    }
    
    if (dbContent) {
      // Add cache busting header
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Return the database content
      return res.json(dbContent);
    } else {
      return res.status(404).json({ error: 'Database not found' });
    }
  } catch (error) {
    console.error('Error serving database:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 