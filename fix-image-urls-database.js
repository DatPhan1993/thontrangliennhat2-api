const fs = require('fs');
const path = require('path');

// Database paths
const DB_PATH = path.join(__dirname, 'database.json');
const API_DB_PATH = path.join(__dirname, 'api/database.json');

/**
 * Standardize image URL to always start with /images/
 * @param {string} url - Original image URL
 * @returns {string} - Standardized image URL
 */
function standardizeImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return url;
  }
  
  // Already correct format
  if (url.startsWith('/images/')) {
    return url;
  }
  
  // Remove leading slash if exists and doesn't start with images/
  if (url.startsWith('/') && !url.startsWith('/images/')) {
    url = url.substring(1);
  }
  
  // Add leading slash and images/ if missing
  if (url.startsWith('images/')) {
    return `/${url}`;
  }
  
  // If it starts with uploads/, prepend /images/
  if (url.startsWith('uploads/')) {
    return `/images/${url}`;
  }
  
  // If it's just a filename, assume it's in uploads/
  if (!url.includes('/') && (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.gif') || url.endsWith('.webp'))) {
    return `/images/uploads/${url}`;
  }
  
  // Return as-is if can't determine format
  return url;
}

/**
 * Fix image URLs in an array
 * @param {Array} images - Array of image URLs
 * @returns {Array} - Array of standardized image URLs
 */
function fixImageArray(images) {
  if (!Array.isArray(images)) {
    return images;
  }
  
  return images.map(img => standardizeImageUrl(img));
}

/**
 * Fix image URLs in all products, services, teams, etc.
 * @param {Object} db - Database object
 * @returns {Object} - Updated database object
 */
function fixDatabaseImageUrls(db) {
  let fixedCount = 0;
  const fixes = [];
  
  // Fix products
  if (db.products && Array.isArray(db.products)) {
    db.products.forEach((product, index) => {
      if (product.images) {
        const originalImages = JSON.stringify(product.images);
        product.images = fixImageArray(product.images);
        const newImages = JSON.stringify(product.images);
        
        if (originalImages !== newImages) {
          fixedCount++;
          fixes.push({
            type: 'product',
            id: product.id,
            name: product.name,
            original: JSON.parse(originalImages),
            fixed: JSON.parse(newImages)
          });
        }
      }
      
      // Fix single image field if exists
      if (product.image && typeof product.image === 'string') {
        const original = product.image;
        product.image = standardizeImageUrl(product.image);
        if (original !== product.image) {
          fixes.push({
            type: 'product-single',
            id: product.id,
            name: product.name,
            original: original,
            fixed: product.image
          });
        }
      }
    });
  }
  
  // Fix services
  if (db.services && Array.isArray(db.services)) {
    db.services.forEach((service, index) => {
      if (service.images) {
        const originalImages = JSON.stringify(service.images);
        service.images = fixImageArray(service.images);
        const newImages = JSON.stringify(service.images);
        
        if (originalImages !== newImages) {
          fixedCount++;
          fixes.push({
            type: 'service',
            id: service.id,
            name: service.name,
            original: JSON.parse(originalImages),
            fixed: JSON.parse(newImages)
          });
        }
      }
      
      if (service.image && typeof service.image === 'string') {
        const original = service.image;
        service.image = standardizeImageUrl(service.image);
        if (original !== service.image) {
          fixes.push({
            type: 'service-single',
            id: service.id,
            name: service.name,
            original: original,
            fixed: service.image
          });
        }
      }
    });
  }
  
  // Fix teams
  if (db.teams && Array.isArray(db.teams)) {
    db.teams.forEach((team, index) => {
      if (team.images) {
        const originalImages = JSON.stringify(team.images);
        team.images = fixImageArray(team.images);
        const newImages = JSON.stringify(team.images);
        
        if (originalImages !== newImages) {
          fixedCount++;
          fixes.push({
            type: 'team',
            id: team.id,
            name: team.name,
            original: JSON.parse(originalImages),
            fixed: JSON.parse(newImages)
          });
        }
      }
      
      if (team.image && typeof team.image === 'string') {
        const original = team.image;
        team.image = standardizeImageUrl(team.image);
        if (original !== team.image) {
          fixes.push({
            type: 'team-single',
            id: team.id,
            name: team.name,
            original: original,
            fixed: team.image
          });
        }
      }
    });
  }
  
  // Fix experiences
  if (db.experiences && Array.isArray(db.experiences)) {
    db.experiences.forEach((exp, index) => {
      if (exp.images) {
        const originalImages = JSON.stringify(exp.images);
        exp.images = fixImageArray(exp.images);
        const newImages = JSON.stringify(exp.images);
        
        if (originalImages !== newImages) {
          fixedCount++;
          fixes.push({
            type: 'experience',
            id: exp.id,
            name: exp.name || exp.title,
            original: JSON.parse(originalImages),
            fixed: JSON.parse(newImages)
          });
        }
      }
    });
  }
  
  // Fix news  
  if (db.news && Array.isArray(db.news)) {
    db.news.forEach((news, index) => {
      if (news.images) {
        const originalImages = JSON.stringify(news.images);
        news.images = fixImageArray(news.images);
        const newImages = JSON.stringify(news.images);
        
        if (originalImages !== newImages) {
          fixedCount++;
          fixes.push({
            type: 'news',
            id: news.id,
            name: news.title,
            original: JSON.parse(originalImages),
            fixed: JSON.parse(newImages)
          });
        }
      }
    });
  }
  
  console.log(`\n✅ Fixed ${fixedCount} image URL issues`);
  
  if (fixes.length > 0) {
    console.log('\n📋 Detailed fixes:');
    fixes.forEach(fix => {
      console.log(`${fix.type} "${fix.name}": ${JSON.stringify(fix.original)} → ${JSON.stringify(fix.fixed)}`);
    });
  }
  
  return db;
}

/**
 * Main function to fix image URLs in database
 */
function fixImageUrls() {
  console.log('🔧 Starting image URL standardization...');
  
  // Check which database files exist
  const dbFiles = [];
  
  if (fs.existsSync(DB_PATH)) {
    dbFiles.push({ path: DB_PATH, name: 'Main database.json' });
  }
  
  if (fs.existsSync(API_DB_PATH)) {
    dbFiles.push({ path: API_DB_PATH, name: 'API database.json' });
  }
  
  if (dbFiles.length === 0) {
    console.error('❌ No database files found!');
    return;
  }
  
  dbFiles.forEach(dbFile => {
    console.log(`\n📂 Processing ${dbFile.name}...`);
    
    try {
      // Read database
      const dbContent = fs.readFileSync(dbFile.path, 'utf8');
      const db = JSON.parse(dbContent);
      
      // Create backup
      const backupPath = `${dbFile.path}.backup-${Date.now()}`;
      fs.writeFileSync(backupPath, dbContent);
      console.log(`📋 Backup created: ${backupPath}`);
      
      // Fix image URLs
      const fixedDb = fixDatabaseImageUrls(db);
      
      // Write updated database
      fs.writeFileSync(dbFile.path, JSON.stringify(fixedDb, null, 2));
      console.log(`✅ Updated ${dbFile.name}`);
      
    } catch (error) {
      console.error(`❌ Error processing ${dbFile.name}:`, error.message);
    }
  });
  
  console.log('\n🎉 Image URL standardization completed!');
  console.log('\n📖 What was fixed:');
  console.log('- All image URLs now start with /images/');
  console.log('- Consistent format across all collections');
  console.log('- Backup files created for safety');
}

// Run the fix
if (require.main === module) {
  fixImageUrls();
}

module.exports = {
  standardizeImageUrl,
  fixImageArray,
  fixDatabaseImageUrls,
  fixImageUrls
}; 