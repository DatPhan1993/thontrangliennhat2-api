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
    // Get product ID from query
    const { id } = req.query;
    const db = getDatabase();
    const products = db.products || [];

    // Add cache control headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // GET - Get a single product
    if (req.method === 'GET') {
      const product = products.find(p => p.id === parseInt(id) || p.id === id);
      
      if (product) {
        return res.status(200).json({
          statusCode: 200,
          message: 'Success',
          data: product,
          timestamp: Date.now()
        });
      } else {
        return res.status(404).json({
          statusCode: 404,
          message: 'Product not found'
        });
      }
    }
    
    // POST - Update a product
    else if (req.method === 'POST' || req.method === 'PUT') {
      const productIndex = products.findIndex(p => p.id === parseInt(id) || p.id === id);
      
      if (productIndex === -1) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Product not found'
        });
      }
      
      // Get the current product
      const currentProduct = products[productIndex];
      
      // Parse request body
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      
      // Create updated product object - preserve all original fields
      const updatedProduct = {
        ...currentProduct,
        id: parseInt(id),
        name: body.name || currentProduct.name,
        content: body.content || currentProduct.content,
        description: body.content || currentProduct.description,
        summary: body.summary || currentProduct.summary,
        child_nav_id: body.child_nav_id ? parseInt(body.child_nav_id) : currentProduct.child_nav_id,
        categoryId: body.child_nav_id ? parseInt(body.child_nav_id) : currentProduct.categoryId,
        features: body.features || currentProduct.features,
        phone_number: body.phone_number || currentProduct.phone_number,
        images: body.images || currentProduct.images,
        slug: currentProduct.slug,
        type: currentProduct.type || "san-pham",
        price: body.price || currentProduct.price,
        discountPrice: body.discountPrice || currentProduct.discountPrice,
        isFeatured: body.isFeatured !== undefined ? body.isFeatured : currentProduct.isFeatured,
        views: currentProduct.views,
        createdAt: currentProduct.createdAt,
        updatedAt: new Date().toISOString()
      };
      
      // Update the product in the database
      products[productIndex] = updatedProduct;
      
      // Save the database
      if (writeDatabase(db)) {
        return res.status(200).json({
          statusCode: 200,
          message: 'Product updated successfully',
          data: updatedProduct,
          timestamp: Date.now()
        });
      } else {
        return res.status(500).json({
          statusCode: 500,
          message: 'Error writing to database'
        });
      }
    }
    
    // DELETE - Delete a product
    else if (req.method === 'DELETE') {
      const productIndex = products.findIndex(p => p.id === parseInt(id) || p.id === id);
      
      if (productIndex === -1) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Product not found'
        });
      }
      
      // Remove the product from the array
      products.splice(productIndex, 1);
      
      // Save the database
      if (writeDatabase(db)) {
        return res.status(200).json({
          statusCode: 200,
          message: 'Product deleted successfully',
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
    console.error('Error handling product request:', error);
    return res.status(500).json({
      statusCode: 500,
      message: 'Server error: ' + error.message
    });
  }
}; 