const fs = require('fs');
const path = require('path');

// Paths to check for source database
const sourcePaths = [
  path.resolve(__dirname, '../database.json'),
  path.resolve(__dirname, 'database.json')
];

// Target path in the API directory
const targetPath = path.resolve(__dirname, 'database.json');

// Find the first available source database
let sourceDb = null;
let sourcePath = null;

for (const dbPath of sourcePaths) {
  if (fs.existsSync(dbPath)) {
    try {
      console.log(`Found database at ${dbPath}`);
      sourceDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      sourcePath = dbPath;
      break;
    } catch (err) {
      console.error(`Error reading database from ${dbPath}:`, err);
    }
  }
}

if (!sourceDb) {
  console.error('No database found in any of the specified paths');
  process.exit(1);
}

// Ensure the database is valid
if (!sourceDb.products || !Array.isArray(sourceDb.products)) {
  console.error('The source database appears to be invalid (missing products array)');
  process.exit(1);
}

// Write to target path
try {
  console.log(`Copying database from ${sourcePath} to ${targetPath}`);
  fs.writeFileSync(targetPath, JSON.stringify(sourceDb, null, 2));
  console.log('Database successfully copied');
} catch (err) {
  console.error('Error writing database:', err);
  process.exit(1);
}

// Create an empty uploads directory if it doesn't exist
const uploadsDir = path.resolve(__dirname, 'images', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log(`Creating uploads directory at ${uploadsDir}`);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

console.log('Database copy script completed successfully'); 