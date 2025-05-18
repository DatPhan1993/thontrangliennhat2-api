/**
 * Vercel setup script - prepares the database for deployment
 * This script runs at build time in the Vercel environment
 */

const fs = require('fs');
const path = require('path');

console.log('Starting Vercel setup script');

// Check the execution environment
const isVercel = process.env.VERCEL === '1';
console.log(`Running in Vercel environment: ${isVercel ? 'Yes' : 'No'}`);

// Check for database file
const dbSourcePath = path.join(__dirname, 'database.json');
console.log(`Checking for database at: ${dbSourcePath}`);

let dbExists = false;
let dbSize = 0;
let dbContent = null;

try {
  dbExists = fs.existsSync(dbSourcePath);
  if (dbExists) {
    const stats = fs.statSync(dbSourcePath);
    dbSize = stats.size;
    console.log(`Database found! Size: ${dbSize} bytes`);
    
    // Read database content
    dbContent = fs.readFileSync(dbSourcePath, 'utf8');
    const db = JSON.parse(dbContent);
    
    // Validate database structure
    const hasProducts = db.products && Array.isArray(db.products);
    const hasServices = db.services && Array.isArray(db.services);
    
    console.log(`Database validation:
    - Has products array: ${hasProducts ? 'Yes' : 'No'}
    - Number of products: ${hasProducts ? db.products.length : 0}
    - Has services array: ${hasServices ? 'Yes' : 'No'}
    - Number of services: ${hasServices ? db.services.length : 0}
    `);
  } else {
    console.error('Database file not found!');
  }
} catch (error) {
  console.error(`Error checking database: ${error.message}`);
}

// Define all destination paths to copy the database
const destinations = [
  path.join(__dirname, 'api', 'database.json'),
  path.join(__dirname, 'public', 'database.json'),
  path.join(__dirname, 'api', 'products', 'database.json'),
  path.join(__dirname, 'api', 'services', 'database.json'),
  path.join(__dirname, 'api', 'experiences', 'database.json'),
  path.join(__dirname, 'api', 'news', 'database.json'),
  '/tmp/database.json'  // Vercel's writable temp directory
];

// Copy database to all destinations if it exists
if (dbExists && dbContent) {
  console.log('Copying database to multiple locations...');
  
  for (const destPath of destinations) {
    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(destPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
      
      // Write the database file
      fs.writeFileSync(destPath, dbContent);
      console.log(`Successfully copied database to: ${destPath}`);
    } catch (error) {
      console.error(`Error copying to ${destPath}: ${error.message}`);
    }
  }
} else {
  console.error('Cannot copy database: Source file not found or empty');
}

// Create a small test database if the main one doesn't exist
if (!dbExists || dbSize === 0) {
  console.log('Creating a minimal test database...');
  
  const testDb = {
    products: [
      {
        id: 1,
        name: "Test Product",
        description: "This is a test product created because the main database was not found",
        createdAt: new Date().toISOString()
      }
    ],
    services: [
      {
        id: 1,
        name: "Test Service",
        description: "This is a test service created because the main database was not found",
        createdAt: new Date().toISOString()
      }
    ],
    experiences: [],
    news: []
  };
  
  const testDbContent = JSON.stringify(testDb, null, 2);
  
  // Write test database to all locations
  try {
    fs.writeFileSync(dbSourcePath, testDbContent);
    console.log(`Created test database at: ${dbSourcePath}`);
    
    // Also copy to all destinations
    for (const destPath of destinations) {
      try {
        const dir = path.dirname(destPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(destPath, testDbContent);
        console.log(`Copied test database to: ${destPath}`);
      } catch (error) {
        console.error(`Error copying test database to ${destPath}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error(`Error creating test database: ${error.message}`);
  }
}

console.log('Vercel setup script completed');
