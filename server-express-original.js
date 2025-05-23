const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Initialize Express app
const app = express();
const PORT = 3001;

// Database path
const DB_PATH = path.join(__dirname, 'database.json');

// Define upload directory and ensure it exists
const UPLOADS_DIR = path.join(__dirname, 'images', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  console.log(`Creating uploads directory: ${UPLOADS_DIR}`);
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniquePrefix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: function(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp|WEBP)$/)) {
      req.fileValidationError = 'Only image files are allowed!';
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Simple CORS configuration for localhost only
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Middleware
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images/uploads', express.static(path.join(__dirname, 'images', 'uploads')));
app.use('/public/images', express.static(path.join(__dirname, 'public', 'images')));

// Cache control for images
app.use((req, res, next) => {
  if (req.path.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// DATABASE FUNCTIONS
// Read the database file
const getDatabase = () => {
  try {
    const rawData = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading database:', error);
    return { 
      products: [], 
      categories: [], 
      news: [], 
      images: [], 
      videos: [],
      services: [],
      navigation: [],
      users: [],
      experiences: []
    };
  }
};

// Write to the database file
const writeDatabase = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
};

// API ROUTES

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = getDatabase();
  
  const user = db.users.find(u => u.email === email && (password === 'password' || password === 'dat12345' || password === u.password));
  
  if (user) {
    res.json({
      statusCode: 200,
      message: 'Login successful',
      data: {
        accessToken: 'fake-token-123456',
        refreshToken: 'fake-refresh-token-123456',
        accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
        refreshTokenExpiresAt: new Date(Date.now() + 604800000).toISOString(),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        }
      }
    });
  } else {
    res.status(401).json({
      statusCode: 401,
      message: 'Invalid credentials'
    });
  }
});

// Navigation Routes
app.get('/api/parent-navs/all-with-child', (req, res) => {
  const db = getDatabase();
  res.json({
    statusCode: 200,
    message: 'Success',
    data: db.navigation
  });
});

app.get('/api/navigation-links', (req, res) => {
  const db = getDatabase();
  res.json(db.navigation);
});

app.get('/api/parent-navs', (req, res) => {
  const db = getDatabase();
  const parentNavs = db.navigation.map(item => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    position: item.position
  }));
  
  res.json({
    statusCode: 200,
    message: 'Success',
    data: parentNavs
  });
});

app.get('/api/parent-navs/slug/:slug', (req, res) => {
  const slug = req.params.slug;
  const db = getDatabase();
  const parentNav = db.navigation.find(nav => nav.slug === slug);
  
  if (parentNav) {
    res.json({
      statusCode: 200,
      message: 'Success',
      data: parentNav.children
    });
  } else {
    res.status(404).json({
      statusCode: 404,
      message: 'Parent navigation not found'
    });
  }
});

app.get('/api/child-navs', (req, res) => {
  const db = getDatabase();
  let allChildren = [];
  
  db.navigation.forEach(parent => {
    allChildren = [...allChildren, ...parent.children.map(child => ({
      ...child,
      parentId: parent.id
    }))];
  });
  
  res.json({
    statusCode: 200,
    message: 'Success',
    data: allChildren
  });
});

// Product Routes
app.get('/api/products', (req, res) => {
  console.log('GET /api/products - Getting all products');
  const db = getDatabase();
  return res.json({
    statusCode: 200,
    data: db.products
  });
});

app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const db = getDatabase();
  const product = db.products.find(p => p.id === id);
  
  if (product) {
    res.json({
      statusCode: 200,
      message: 'Success',
      data: product
    });
  } else {
    res.status(404).json({
      statusCode: 404,
      message: 'Product not found'
    });
  }
});

app.post('/api/products', upload.array('images[]', 10), (req, res) => {
  try {
    console.log('POST /api/products - Creating new product:', req.body);
    
    const db = getDatabase();
    
    const { 
      name, 
      content, 
      child_nav_id, 
      summary, 
      features,
      phone_number,
      type,
      isFeatured
    } = req.body;
    
    const newId = db.products.length > 0 
      ? Math.max(...db.products.map(p => p.id)) + 1 
      : 1;
    
    const slug = name
      .toLowerCase()
      .replace(/[^\w\sáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/á|à|ả|ã|ạ|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/g, 'a')
      .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/g, 'e')
      .replace(/í|ì|ỉ|ĩ|ị/g, 'i')
      .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/g, 'o')
      .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/g, 'u')
      .replace(/ý|ỳ|ỷ|ỹ|ỵ/g, 'y')
      .replace(/đ/g, 'd');
    
    let imageFiles = [];
    if (req.files && req.files.length > 0) {
      imageFiles = req.files.map(file => {
        const imagePath = `/images/uploads/${file.filename}`;
        console.log(`Created image path: ${imagePath}`);
        return imagePath;
      });
    }
    
    const newProduct = {
      id: newId,
      name,
      images: imageFiles.length > 0 ? imageFiles : [],
      content,
      slug,
      summary,
      child_nav_id: child_nav_id ? parseInt(child_nav_id) : null,
      features: features || "[]",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      phone_number: phone_number || "",
      type: type || "san-pham",
      isFeatured: isFeatured === "true" || false
    };
    
    db.products.push(newProduct);
    writeDatabase(db);
    
    console.log(`Created product with ID ${newId}`);
    
    return res.status(201).json({
      statusCode: 201,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      statusCode: 500,
      message: 'Error creating product',
      error: error.message
    });
  }
});

app.post('/api/products/:id', upload.array('images[]', 5), (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    
    const db = getDatabase();
    const productIndex = db.products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Product not found'
      });
    }
    
    const currentProduct = db.products[productIndex];
    
    const { name, content, child_nav_id, summary, features, phone_number } = req.body;
    
    const uploadedFiles = req.files || [];
    const newFileUrls = uploadedFiles.map(file => {
      const imagePath = `/images/uploads/${file.filename}`;
      return imagePath;
    });
    
    let existingImages = [];
    if (req.body['images[]']) {
      if (Array.isArray(req.body['images[]'])) {
        existingImages = req.body['images[]'].filter(img => img && img.trim() !== '');
      } else if (req.body['images[]'] && req.body['images[]'].trim() !== '') {
        existingImages = [req.body['images[]']];
      }
    }
    
    const allImages = [...existingImages, ...newFileUrls];
    
    const updatedProduct = {
      ...currentProduct,
      name: name || currentProduct.name,
      content: content || currentProduct.content,
      child_nav_id: child_nav_id ? parseInt(child_nav_id) : currentProduct.child_nav_id,
      summary: summary || currentProduct.summary,
      features: features || currentProduct.features,
      phone_number: phone_number || currentProduct.phone_number,
      updatedAt: new Date().toISOString()
    };
    
    if (allImages.length > 0) {
      updatedProduct.images = allImages;
    }
    
    db.products[productIndex] = updatedProduct;
    
    if (writeDatabase(db)) {
      return res.status(200).json({
        statusCode: 200,
        message: 'Product updated successfully',
        data: updatedProduct
      });
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: 'Error writing to database'
      });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: error.message
    });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    
    const db = getDatabase();
    const productIndex = db.products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Product not found'
      });
    }
    
    const deletedProduct = db.products[productIndex];
    db.products.splice(productIndex, 1);
    
    if (writeDatabase(db)) {
      if (deletedProduct.images && Array.isArray(deletedProduct.images)) {
        deletedProduct.images.forEach(imagePath => {
          try {
            if (typeof imagePath === 'string' && 
                (imagePath.includes('/images/uploads/') || imagePath.includes('/uploads/'))) {
              const filename = path.basename(imagePath);
              
              const possiblePaths = [
                path.join(__dirname, 'images', 'uploads', filename),
                path.join(__dirname, 'uploads', filename),
                path.join(__dirname, 'public', 'images', 'uploads', filename)
              ];
              
              possiblePaths.forEach(filePath => {
                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
                  console.log(`Deleted image file: ${filePath}`);
                }
              });
            }
          } catch (fileError) {
            console.error(`Error deleting image file: ${imagePath}`, fileError);
          }
        });
      }
      
      return res.status(200).json({
        statusCode: 200,
        message: 'Product deleted successfully',
        data: deletedProduct
      });
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: 'Error writing to database'
      });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      error: error.message
    });
  }
});

// Service Routes
app.get('/api/services', (req, res) => {
  const db = getDatabase();
  res.json({
    statusCode: 200,
    message: 'Success',
    data: db.services
  });
});

// Team Routes
app.get('/api/teams', (req, res) => {
  const db = getDatabase();
  const teams = db.team || [];
  
  res.json({
    statusCode: 200,
    message: 'Success',
    data: teams
  });
});

// News Routes
app.get('/api/news', (req, res) => {
  const db = getDatabase();
  res.json({
    statusCode: 200,
    message: 'Success',
    data: db.news
  });
});

// Experience Routes
app.get('/api/experiences', (req, res) => {
  const db = getDatabase();
  res.json({
    statusCode: 200,
    message: 'Success',
    data: db.experiences
  });
});

// File upload endpoint
app.post('/api/upload/image', upload.single('image'), (req, res) => {
  try {
    console.log('File upload request received');
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({
        statusCode: 400,
        message: 'No file uploaded'
      });
    }
    
    console.log('File uploaded:', req.file);
    
    const filePath = path.join(UPLOADS_DIR, req.file.filename);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found at ${filePath}`);
      return res.status(500).json({
        statusCode: 500,
        message: 'File not saved to disk'
      });
    }
    
    const fileUrlPath = `/images/uploads/${req.file.filename}`;
    const absoluteUrlPath = `http://localhost:${PORT}${fileUrlPath}`;
    
    console.log('File URL:', fileUrlPath);
    
    res.json({
      statusCode: 200,
      message: 'File uploaded successfully',
      data: {
        url: fileUrlPath,
        absoluteUrl: absoluteUrlPath,
        originalname: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Error uploading file: ' + error.message
    });
  }
});

// Image fallback handler
app.use((req, res, next) => {
  if (req.path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    const filePath = path.join(__dirname, req.path);
    
    if (!fs.existsSync(filePath)) {
      const filename = path.basename(req.path);
      const uploadsPaths = [
        path.join(__dirname, 'uploads', filename),
        path.join(__dirname, 'images', 'uploads', filename),
        path.join(__dirname, 'public', 'images', 'uploads', filename)
      ];
      
      for (const uploadPath of uploadsPaths) {
        if (fs.existsSync(uploadPath)) {
          console.log(`Found image in alternative location: ${uploadPath}`);
          return res.sendFile(uploadPath);
        }
      }
      
      const fallbackImage = path.join(__dirname, 'public', 'images', 'placeholder.jpg');
      if (fs.existsSync(fallbackImage)) {
        console.log(`Using fallback image: ${fallbackImage}`);
        return res.sendFile(fallbackImage);
      }
    }
  }
  next();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log(`
Các endpoints API:
- http://localhost:${PORT}/api/navigation-links
- http://localhost:${PORT}/api/parent-navs/all-with-child
- http://localhost:${PORT}/api/parent-navs
- http://localhost:${PORT}/api/child-navs
- http://localhost:${PORT}/api/products
- http://localhost:${PORT}/api/services
- http://localhost:${PORT}/api/teams
- http://localhost:${PORT}/api/news
- http://localhost:${PORT}/api/experiences
  `);
});