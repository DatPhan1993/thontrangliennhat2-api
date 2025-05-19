/**
 * Script to copy images during build for Vercel deployment
 * This ensures that images are properly copied to the .vercel/output/static directory
 */
const fs = require('fs');
const path = require('path');

// Source directories
const sourceImageDir = path.join(__dirname, 'images');
const sourceUploadDir = path.join(__dirname, 'uploads');

// Destination directories (for Vercel)
const destImageDir = path.join(__dirname, 'public', 'images');
const destUploadDir = path.join(__dirname, 'public', 'uploads');

// Helper function to recursively copy directories
function copyDirRecursively(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
    console.log(`Created directory: ${dest}`);
  }

  // Read source directory
  if (fs.existsSync(src)) {
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        // Recursively copy subdirectory
        copyDirRecursively(srcPath, destPath);
      } else {
        // Copy file
        try {
          fs.copyFileSync(srcPath, destPath);
          console.log(`Copied file: ${entry.name}`);
        } catch (err) {
          console.error(`Error copying file ${entry.name}: ${err.message}`);
        }
      }
    }
  } else {
    console.warn(`Source directory does not exist: ${src}`);
  }
}

// Start copying process
console.log('Starting image copy process for Vercel deployment...');

// Copy images
if (fs.existsSync(sourceImageDir)) {
  console.log(`Copying images from ${sourceImageDir} to ${destImageDir}`);
  copyDirRecursively(sourceImageDir, destImageDir);
} else {
  console.warn(`Source image directory not found: ${sourceImageDir}`);
}

// Copy uploads
if (fs.existsSync(sourceUploadDir)) {
  console.log(`Copying uploads from ${sourceUploadDir} to ${destUploadDir}`);
  copyDirRecursively(sourceUploadDir, destUploadDir);
} else {
  console.warn(`Source upload directory not found: ${sourceUploadDir}`);
}

console.log('Image copy process completed.'); 