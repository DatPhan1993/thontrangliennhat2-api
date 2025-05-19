/**
 * Build script for Vercel deployment
 * This replaces the functionality in vercel-build.sh
 */
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting Vercel build process...');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATABASE_PATH = path.join(ROOT_DIR, 'database.json');
const API_DIR = path.join(ROOT_DIR, 'api');

// Create required directories
const directories = [
  API_DIR,
  path.join(API_DIR, 'products'),
  path.join(API_DIR, 'services'),
  path.join(API_DIR, 'experiences'),
  path.join(API_DIR, 'news'),
  path.join(ROOT_DIR, 'uploads'),
  path.join(ROOT_DIR, 'images')
];

// Create directories
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Check if database.json exists, create if not
if (fs.existsSync(DATABASE_PATH)) {
  const stats = fs.statSync(DATABASE_PATH);
  console.log(`database.json exists, size: ${stats.size} bytes`);
  
  // Copy database.json to API directory
  fs.copySync(DATABASE_PATH, path.join(API_DIR, 'database.json'));
  console.log('Database file copied to API directory');
} else {
  console.log('WARNING: database.json not found in root directory!');
  
  // Create an empty database if it doesn't exist
  const emptyDb = {
    products: [],
    services: [],
    experiences: [],
    news: [],
    syncInfo: {
      lastSync: new Date().toISOString()
    }
  };
  
  fs.writeJSONSync(DATABASE_PATH, emptyDb, { spaces: 2 });
  fs.copySync(DATABASE_PATH, path.join(API_DIR, 'database.json'));
  console.log('Created empty database.json');
}

// Run vercel-setup.js to prepare environment if it exists
const setupPath = path.join(ROOT_DIR, 'vercel-setup.js');
if (fs.existsSync(setupPath)) {
  console.log('Running vercel-setup.js...');
  try {
    require(setupPath);
  } catch (error) {
    console.error('Error running vercel-setup.js:', error.message);
  }
}

console.log('Build process completed successfully'); 