const { readDatabase } = require('../../database-utils');
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  console.log('Products API endpoint accessed');
  
  // Set comprehensive CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization, Cache-Control, Pragma, Expires, X-Cache-Control, X-Timestamp, X-Nocache');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET method for now
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Use the database utility to get the products
  const database = readDatabase();
  const products = database.products || [];
  
  // Return products data
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    statusCode: 200,
    message: "Success",
    data: products
  });
}; 