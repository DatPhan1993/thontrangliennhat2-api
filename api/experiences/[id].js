const { getDatabase, writeDatabase } = require('../database');
const { readDatabase } = require('../../database-utils');

module.exports = async (req, res) => {
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
    // Get experience ID from query
    const { id } = req.query;
    const db = getDatabase();
    const experiences = db.experiences || [];

    // Add cache control headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // GET - Get a single experience
    if (req.method === 'GET') {
      const experience = experiences.find(e => e.id === parseInt(id) || e.id === id);
      
      if (experience) {
        return res.status(200).json({
          statusCode: 200,
          message: 'Success',
          data: experience,
          timestamp: Date.now()
        });
      } else {
        return res.status(404).json({
          statusCode: 404,
          message: 'Experience not found'
        });
      }
    }
    
    // POST - Update an experience
    else if (req.method === 'POST' || req.method === 'PUT') {
      const experienceIndex = experiences.findIndex(e => e.id === parseInt(id) || e.id === id);
      
      if (experienceIndex === -1) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Experience not found'
        });
      }
      
      // Get the current experience
      const currentExperience = experiences[experienceIndex];
      
      // Parse request body
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      
      // Create updated experience object - preserve all original fields
      const updatedExperience = {
        ...currentExperience,
        id: parseInt(id),
        name: body.name || currentExperience.name,
        title: body.name || currentExperience.title,
        content: body.content || currentExperience.content,
        description: body.content || currentExperience.description,
        summary: body.summary || currentExperience.summary,
        child_nav_id: body.child_nav_id ? parseInt(body.child_nav_id) : currentExperience.child_nav_id,
        categoryId: body.child_nav_id ? parseInt(body.child_nav_id) : currentExperience.categoryId,
        images: body.images || currentExperience.images,
        slug: currentExperience.slug,
        type: currentExperience.type || "trai-nghiem",
        isFeatured: body.isFeatured !== undefined ? body.isFeatured : currentExperience.isFeatured,
        views: currentExperience.views,
        createdAt: currentExperience.createdAt,
        updatedAt: new Date().toISOString()
      };
      
      // Update the experience in the database
      experiences[experienceIndex] = updatedExperience;
      
      // Save the database
      if (writeDatabase(db)) {
        return res.status(200).json({
          statusCode: 200,
          message: 'Experience updated successfully',
          data: updatedExperience,
          timestamp: Date.now()
        });
      } else {
        return res.status(500).json({
          statusCode: 500,
          message: 'Error writing to database'
        });
      }
    }
    
    // DELETE - Delete an experience
    else if (req.method === 'DELETE') {
      const experienceIndex = experiences.findIndex(e => e.id === parseInt(id) || e.id === id);
      
      if (experienceIndex === -1) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Experience not found'
        });
      }
      
      // Remove the experience from the array
      experiences.splice(experienceIndex, 1);
      
      // Save the database
      if (writeDatabase(db)) {
        return res.status(200).json({
          statusCode: 200,
          message: 'Experience deleted successfully',
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
    console.error('Error handling experience request:', error);
    return res.status(500).json({
      statusCode: 500,
      message: 'Server error: ' + error.message
    });
  }
}; 