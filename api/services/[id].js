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
    // Get service ID from query
    const { id } = req.query;
    const db = getDatabase();
    const services = db.services || [];

    // Add cache control headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // GET - Get a single service
    if (req.method === 'GET') {
      const service = services.find(s => s.id === parseInt(id) || s.id === id);
      
      if (service) {
        return res.status(200).json({
          statusCode: 200,
          message: 'Success',
          data: service,
          timestamp: Date.now()
        });
      } else {
        return res.status(404).json({
          statusCode: 404,
          message: 'Service not found'
        });
      }
    }
    
    // POST - Update a service
    else if (req.method === 'POST' || req.method === 'PUT') {
      const serviceIndex = services.findIndex(s => s.id === parseInt(id) || s.id === id);
      
      if (serviceIndex === -1) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Service not found'
        });
      }
      
      // Get the current service
      const currentService = services[serviceIndex];
      
      // Parse request body
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      
      // Create updated service object - preserve all original fields
      const updatedService = {
        ...currentService,
        id: parseInt(id),
        name: body.name || currentService.name,
        content: body.content || currentService.content,
        description: body.content || currentService.description,
        summary: body.summary || currentService.summary,
        child_nav_id: body.child_nav_id ? parseInt(body.child_nav_id) : currentService.child_nav_id,
        categoryId: body.child_nav_id ? parseInt(body.child_nav_id) : currentService.categoryId,
        features: body.features || currentService.features,
        phone_number: body.phone_number || currentService.phone_number,
        images: body.images || currentService.images,
        slug: currentService.slug,
        type: currentService.type || "dich-vu",
        isFeatured: body.isFeatured !== undefined ? body.isFeatured : currentService.isFeatured,
        views: currentService.views,
        createdAt: currentService.createdAt,
        updatedAt: new Date().toISOString()
      };
      
      // Update the service in the database
      services[serviceIndex] = updatedService;
      
      // Save the database
      if (writeDatabase(db)) {
        return res.status(200).json({
          statusCode: 200,
          message: 'Service updated successfully',
          data: updatedService,
          timestamp: Date.now()
        });
      } else {
        return res.status(500).json({
          statusCode: 500,
          message: 'Error writing to database'
        });
      }
    }
    
    // DELETE - Delete a service
    else if (req.method === 'DELETE') {
      const serviceIndex = services.findIndex(s => s.id === parseInt(id) || s.id === id);
      
      if (serviceIndex === -1) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Service not found'
        });
      }
      
      // Remove the service from the array
      services.splice(serviceIndex, 1);
      
      // Save the database
      if (writeDatabase(db)) {
        return res.status(200).json({
          statusCode: 200,
          message: 'Service deleted successfully',
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
    console.error('Error handling service request:', error);
    return res.status(500).json({
      statusCode: 500,
      message: 'Server error: ' + error.message
    });
  }
}; 