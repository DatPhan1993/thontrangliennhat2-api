/**
 * Script to update CORS headers in all API files
 * This script ensures all API endpoints properly handle CORS for thontrangliennhat.com
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// CORS headers to be inserted in all API files - with improved origin detection
const corsHeaders = `
  // Set CORS headers for requests based on origin
  const allowedOrigins = [
    'https://thontrangliennhat.com',
    'http://thontrangliennhat.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://thontrangliennhat.com');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization, Cache-Control, Pragma, Expires, X-Cache-Control, X-Timestamp, X-Nocache');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Vary', 'Origin');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
`;

// Find all API files
const apiDir = path.join(__dirname, 'api');
const apiFiles = glob.sync(`${apiDir}/**/*.js`);

console.log(`Found ${apiFiles.length} API files to update`);

// Process each API file
let updatedCount = 0;
let skippedCount = 0;

for (const filePath of apiFiles) {
  try {
    // Skip the cors middleware files themselves
    if (filePath.includes('cors-middleware.js') || 
        filePath.includes('options-handler.js')) {
      console.log(`Skipping CORS utility file: ${filePath}`);
      skippedCount++;
      continue;
    }
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if file already has our CORS middleware import
    if (content.includes('cors-middleware.js') || 
        content.includes('allowedOrigins')) {
      console.log(`Skipping file (already has enhanced CORS headers): ${filePath}`);
      skippedCount++;
      continue;
    }
    
    // Common API handler pattern check
    const handlerPatterns = [
      'module.exports = (req, res) => {',
      'module.exports = async (req, res) => {',
      'export default (req, res) => {',
      'export default async (req, res) => {'
    ];
    
    let updated = false;
    
    for (const pattern of handlerPatterns) {
      if (content.includes(pattern)) {
        // Find position right after the pattern opening brace
        const insertPos = content.indexOf(pattern) + pattern.length;
        
        // Insert CORS headers
        content = content.slice(0, insertPos) + corsHeaders + content.slice(insertPos);
        
        // Save updated file
        fs.writeFileSync(filePath, content);
        console.log(`Updated CORS headers in: ${filePath}`);
        updatedCount++;
        updated = true;
        break;
      }
    }
    
    if (!updated) {
      // Try to find appropriate position for files with different structure
      if (content.includes('function handler') || content.includes('async function handler')) {
        // Find position after the handler function opening brace
        const handlerPos = content.indexOf('function handler');
        const asyncHandlerPos = content.indexOf('async function handler');
        const pos = handlerPos !== -1 ? handlerPos : asyncHandlerPos;
        
        if (pos !== -1) {
          // Find the opening brace
          const bracePos = content.indexOf('{', pos) + 1;
          
          // Insert CORS headers
          content = content.slice(0, bracePos) + corsHeaders + content.slice(bracePos);
          
          // Save updated file
          fs.writeFileSync(filePath, content);
          console.log(`Updated CORS headers in handler function: ${filePath}`);
          updatedCount++;
          continue;
        }
      }
      
      console.log(`Could not find handler pattern in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating CORS in ${filePath}:`, error.message);
  }
}

console.log('\nCORS Update Summary:');
console.log(`Total API files found: ${apiFiles.length}`);
console.log(`Files updated: ${updatedCount}`);
console.log(`Files skipped (already had CORS headers): ${skippedCount}`);
console.log(`Files not updated: ${apiFiles.length - updatedCount - skippedCount}`);

console.log('\nRemember to redeploy your API after these changes!'); 