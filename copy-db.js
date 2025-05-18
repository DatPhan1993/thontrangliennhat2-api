/**
 * Script to copy database.json to all required locations during build
 */
const fs = require('fs');
const path = require('path');

// Source database file
const sourceDbPath = path.join(__dirname, 'database.json');

// Target locations
const targetLocations = [
  path.join(__dirname, 'api', 'database.json'),
  path.join(__dirname, 'public', 'database.json')
];

// Ensure directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Copy database file
async function copyDatabase() {
  try {
    // Check if source exists
    if (!fs.existsSync(sourceDbPath)) {
      console.error(`Source database not found at ${sourceDbPath}`);
      process.exit(1);
    }

    // Read source database
    const dbContent = fs.readFileSync(sourceDbPath, 'utf8');
    console.log(`Read source database: ${sourceDbPath} (${dbContent.length} bytes)`);

    // Copy to all target locations
    for (const targetPath of targetLocations) {
      const targetDir = path.dirname(targetPath);
      ensureDirectoryExists(targetDir);
      
      fs.writeFileSync(targetPath, dbContent);
      console.log(`Copied database to: ${targetPath}`);
    }

    console.log('Database copy completed successfully');
  } catch (error) {
    console.error('Error copying database:', error);
    process.exit(1);
  }
}

// Execute copy
copyDatabase(); 