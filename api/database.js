/**
 * API endpoint to serve the database file directly
 */
const fs = require('fs');
const path = require('path');

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
  
  // Possible database locations
  const possiblePaths = [
    path.join(__dirname, '../database.json'),
    path.join(__dirname, 'database.json'),
    '/var/task/database.json',
    '/var/task/api/database.json',
    path.join(process.cwd(), 'database.json'),
    path.join(process.cwd(), 'api/database.json')
  ];
  
  // Check each possible path
  for (const dbPath of possiblePaths) {
    try {
      if (fs.existsSync(dbPath)) {
        console.log(`Found database at: ${dbPath}`);
        const data = fs.readFileSync(dbPath, 'utf8');
        
        try {
          // Try to parse the data as JSON to validate it
          const parsedData = JSON.parse(data);
          
          // Set content type and serve the database
          res.setHeader('Content-Type', 'application/json');
          return res.status(200).send(data);
        } catch (parseError) {
          console.error(`Error parsing database JSON: ${parseError.message}`);
        }
      }
    } catch (err) {
      console.error(`Error checking database at ${dbPath}: ${err.message}`);
    }
  }
  
  // If we get here, we couldn't find a valid database file
  // Create a minimal database to return
  const fallbackDb = {
    products: [
      {
        id: 999,
        name: 'Fallback Product',
        description: 'This is a fallback product created because the database file could not be found',
        createdAt: new Date().toISOString()
      }
    ],
    services: [
      {
        id: 999,
        name: 'Fallback Service',
        description: 'This is a fallback service created because the database file could not be found',
        createdAt: new Date().toISOString()
      }
    ],
    fallback: true,
    error: 'Could not find database file'
  };
  
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json(fallbackDb);
}; 