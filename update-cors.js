/**
 * Script to update CORS headers in API files
 */
const fs = require('fs');
const path = require('path');

// List of API files that need CORS headers
const apiFiles = [
  path.join(__dirname, 'api', 'index.js'),
  path.join(__dirname, 'api', 'products', 'index.js'),
  path.join(__dirname, 'api', 'services', 'index.js'),
  path.join(__dirname, 'api', 'experiences', 'index.js'),
  path.join(__dirname, 'api', 'news', 'index.js'),
  path.join(__dirname, 'api', 'database.js')
];

// CORS headers to add
const corsHeaders = `
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Add cache control headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
`;

console.log('Updating CORS headers in API files...');

// Process each file
for (const filePath of apiFiles) {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Check if file already has CORS headers
      if (content.includes('Access-Control-Allow-Origin')) {
        console.log(`File already has CORS headers: ${filePath}`);
        continue;
      }
      
      // Find the position to insert headers (after module.exports line)
      const moduleExportsPos = content.indexOf('module.exports = (req, res) => {');
      
      if (moduleExportsPos !== -1) {
        // Insert after the opening brace
        const insertPos = moduleExportsPos + 'module.exports = (req, res) => {'.length;
        const newContent = content.slice(0, insertPos) + corsHeaders + content.slice(insertPos);
        
        // Write updated file
        fs.writeFileSync(filePath, newContent);
        console.log(`Updated CORS headers in: ${filePath}`);
      } else {
        console.log(`Could not find module.exports in: ${filePath}`);
      }
    } else {
      console.log(`File does not exist: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating CORS in ${filePath}: ${error.message}`);
  }
}

console.log('CORS update completed');
