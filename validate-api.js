/**
 * API Validation Script
 * 
 * This script tests the API endpoints to ensure they're working properly
 * and helps diagnose issues with the API deployment.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'https://thontrangliennhat2-api-phan-dats-projects-d067d5c1.vercel.app';
const ENDPOINTS = [
  '/',
  '/products',
  '/services',
  '/experiences',
  '/news',
  '/database.json'
];

// Check if database exists locally
console.log('Checking local database...');
const dbPath = path.join(__dirname, 'database.json');

if (fs.existsSync(dbPath)) {
  const stats = fs.statSync(dbPath);
  console.log(`Local database exists: ${dbPath} (${stats.size} bytes)`);
  
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(data);
    
    if (db.products && Array.isArray(db.products)) {
      console.log(`Database has ${db.products.length} products`);
    } else {
      console.log('Database does not have a valid products array');
    }
  } catch (err) {
    console.error('Error reading local database:', err);
  }
} else {
  console.log('Local database not found!');
}

// Make an HTTP request to test an API endpoint
function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${API_URL}${endpoint}`;
    console.log(`Testing endpoint: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      // Log status code and headers
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      
      // A chunk of data has been received
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      // The whole response has been received
      res.on('end', () => {
        let result = {
          endpoint,
          statusCode: res.statusCode,
          headers: res.headers,
          success: res.statusCode >= 200 && res.statusCode < 300
        };
        
        try {
          // Try to parse as JSON
          const parsedData = JSON.parse(data);
          result.dataType = 'json';
          result.data = parsedData;
          
          if (parsedData.data && Array.isArray(parsedData.data)) {
            result.count = parsedData.data.length;
            console.log(`Received ${result.count} items`);
          }
        } catch (e) {
          // Not JSON or parsing error
          result.dataType = 'text';
          result.dataLength = data.length;
          console.log(`Received ${data.length} bytes of non-JSON data`);
        }
        
        resolve(result);
      });
    }).on('error', (err) => {
      console.error(`Error testing ${endpoint}:`, err.message);
      reject({
        endpoint,
        success: false,
        error: err.message
      });
    });
  });
}

// Test all endpoints
async function testAllEndpoints() {
  console.log('Starting API validation...');
  const results = [];
  
  for (const endpoint of ENDPOINTS) {
    try {
      const result = await testEndpoint(endpoint);
      results.push(result);
    } catch (error) {
      results.push(error);
    }
  }
  
  // Output a summary
  console.log('\n=== API VALIDATION SUMMARY ===');
  let successCount = 0;
  
  for (const result of results) {
    if (result.success) {
      successCount++;
      console.log(`✅ ${result.endpoint}: OK (${result.statusCode})`);
    } else {
      console.log(`❌ ${result.endpoint}: FAILED ${result.statusCode || result.error}`);
    }
  }
  
  console.log(`\nTotal: ${successCount}/${ENDPOINTS.length} endpoints working\n`);
  
  // Write results to file
  const reportPath = path.join(__dirname, 'api-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`Full report written to: ${reportPath}`);
}

// Run the tests
testAllEndpoints().catch(err => {
  console.error('Error during API validation:', err);
}); 