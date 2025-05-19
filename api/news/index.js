// News API endpoint
const { readDatabase } = require('../../database-utils');
const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization, cache-control, pragma, expires');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET method for now
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Use the database utility to get the news
  const database = readDatabase();
  const news = database.news || [];
  
  // Return news data
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json(news);
}; 