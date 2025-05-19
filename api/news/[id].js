const { getDatabase, writeDatabase } = require('../database');
const { readDatabase } = require('../../database-utils');

module.exports = async (req, res) => {
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

  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', 'https://thontrangliennhat.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Get news ID from query
    const { id } = req.query;
    const db = getDatabase();
    const news = db.news || [];

    // Add cache control headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // GET - Get a single news article
    if (req.method === 'GET') {
      const newsItem = news.find(n => n.id === parseInt(id) || n.id === id);
      
      if (newsItem) {
        return res.status(200).json({
          statusCode: 200,
          message: 'Success',
          data: newsItem,
          timestamp: Date.now()
        });
      } else {
        return res.status(404).json({
          statusCode: 404,
          message: 'News not found'
        });
      }
    }
    
    // POST - Update a news article
    else if (req.method === 'POST' || req.method === 'PUT') {
      const newsIndex = news.findIndex(n => n.id === parseInt(id) || n.id === id);
      
      if (newsIndex === -1) {
        return res.status(404).json({
          statusCode: 404,
          message: 'News not found'
        });
      }
      
      // Get the current news
      const currentNews = news[newsIndex];
      
      // Parse request body
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      
      // Create updated news object - preserve all original fields
      const updatedNews = {
        ...currentNews,
        id: parseInt(id),
        title: body.title || currentNews.title,
        name: body.title || currentNews.name,
        content: body.content || currentNews.content,
        description: body.content || currentNews.description,
        summary: body.summary || currentNews.summary,
        categoryId: body.categoryId ? parseInt(body.categoryId) : currentNews.categoryId,
        child_nav_id: body.categoryId ? parseInt(body.categoryId) : currentNews.child_nav_id,
        images: body.images || currentNews.images,
        slug: currentNews.slug,
        type: currentNews.type || "tin-tuc",
        isFeatured: body.isFeatured !== undefined ? body.isFeatured : currentNews.isFeatured,
        views: currentNews.views,
        createdAt: currentNews.createdAt,
        updatedAt: new Date().toISOString()
      };
      
      // Update the news in the database
      news[newsIndex] = updatedNews;
      
      // Save the database
      if (writeDatabase(db)) {
        return res.status(200).json({
          statusCode: 200,
          message: 'News updated successfully',
          data: updatedNews,
          timestamp: Date.now()
        });
      } else {
        return res.status(500).json({
          statusCode: 500,
          message: 'Error writing to database'
        });
      }
    }
    
    // DELETE - Delete a news article
    else if (req.method === 'DELETE') {
      const newsIndex = news.findIndex(n => n.id === parseInt(id) || n.id === id);
      
      if (newsIndex === -1) {
        return res.status(404).json({
          statusCode: 404,
          message: 'News not found'
        });
      }
      
      // Remove the news from the array
      news.splice(newsIndex, 1);
      
      // Save the database
      if (writeDatabase(db)) {
        return res.status(200).json({
          statusCode: 200,
          message: 'News deleted successfully',
          timestamp: Date.now()
        });
      } else {
        return res.status(500).json({
          statusCode: 500,
          message: 'Error writing to database'
        });
      }
    }
    
    // Unsupported method
    else {
      return res.status(405).json({
        statusCode: 405,
        message: 'Method not allowed'
      });
    }
    
  } catch (error) {
    console.error('Error handling news request:', error);
    return res.status(500).json({
      statusCode: 500,
      message: 'Server error: ' + error.message
    });
  }
}; 