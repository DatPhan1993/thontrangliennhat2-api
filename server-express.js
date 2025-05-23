const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration
const corsOptions = {
  // Allow multiple origins for different environments
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',      // React development server
      'http://127.0.0.1:3000',      // Alternative localhost
      'http://localhost:3001',      // API server itself
      'http://127.0.0.1:3001',      // Alternative localhost for API
      'https://thontrangliennhat.com',     // Production domain
      'https://www.thontrangliennhat.com', // Production domain with www
      'https://thontrangliennhat-api.vercel.app', // Vercel API domain
      'https://api.thontrangliennhat.com',  // Custom API domain
      // Add production domains here when deploying
      // 'https://yourdomain.com',
      // 'https://www.yourdomain.com'
    ];
    
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  
  // Allow specific HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  
  // Allow specific headers
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization',
    'Cache-Control',
    'Pragma',
    'Expires',
    'X-Cache-Control',
    'X-Timestamp',
    'X-Nocache',
    'X-Content-Type-Options',
    'X-Frame-Options'
  ],
  
  // Allow credentials (cookies, authorization headers, etc.)
  credentials: true,
  
  // Cache preflight response for 1 hour
  maxAge: 3600,
  
  // Handle preflight for all routes
  preflightContinue: false,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Additional security headers
app.use((req, res, next) => {
  // Set security headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'SAMEORIGIN'); // Changed from DENY to SAMEORIGIN
  res.header('X-XSS-Protection', '1; mode=block');
  
  // Add proper Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: http:",
    "media-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "connect-src 'self' https: http:"
  ].join('; ');
  
  res.header('Content-Security-Policy', csp);
  
  // Custom CORS handling for specific file types
  if (req.path.endsWith('.css') || req.path.endsWith('.js') || req.path.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot)$/i)) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cache-Control', 'public, max-age=31536000'); // 1 year cache for static assets
  }
  
  // Set proper content type for fonts
  if (req.path.match(/\.(woff|woff2)$/i)) {
    res.header('Content-Type', 'font/woff');
  } else if (req.path.match(/\.ttf$/i)) {
    res.header('Content-Type', 'font/ttf');
  } else if (req.path.match(/\.eot$/i)) {
    res.header('Content-Type', 'application/vnd.ms-fontobject');
  }
  
  next();
});

// Enhanced logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const origin = req.get('Origin') || 'no-origin';
  console.log(`[${timestamp}] ${req.method} ${req.url} - Origin: ${origin} - User-Agent: ${req.get('User-Agent')?.substring(0, 50) || 'unknown'}`);
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Improved static file serving configuration
app.use(express.static(path.join(__dirname, 'public')));
app.use('/styles', express.static(path.join(__dirname, 'public', 'styles')));
app.use('/css', express.static(path.join(__dirname, 'public', 'styles')));
app.use('/fonts', express.static(path.join(__dirname, 'public', 'fonts')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/images/teams', express.static(path.join(__dirname, 'images', 'teams')));
app.use('/uploads', express.static(path.join(__dirname, 'images', 'uploads')));
app.use('/images/uploads', express.static(path.join(__dirname, 'images', 'uploads')));

// Create additional static directory for videos
app.use('/videos', express.static(path.join(__dirname, 'videos')));

// Font file handling middleware
app.use('/assets/fonts', express.static(path.join(__dirname, 'public', 'fonts')));
app.use('/fonts', (req, res, next) => {
  // Set proper CORS for fonts
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  
  // Set proper cache headers for fonts
  res.header('Cache-Control', 'public, max-age=31536000');
  
  next();
});

// Create videos directory if it doesn't exist
const VIDEOS_DIR = path.join(__dirname, 'videos');
if (!fs.existsSync(VIDEOS_DIR)) {
  console.log(`Creating videos directory: ${VIDEOS_DIR}`);
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

// Create fonts directory if it doesn't exist
const FONTS_DIR = path.join(__dirname, 'public', 'fonts');
if (!fs.existsSync(FONTS_DIR)) {
  console.log(`Creating fonts directory: ${FONTS_DIR}`);
  fs.mkdirSync(FONTS_DIR, { recursive: true });
}

// Create an empty placeholder video if it doesn't exist 
const placeholderVideo = path.join(VIDEOS_DIR, 'placeholder.mp4');
if (!fs.existsSync(placeholderVideo)) {
  try {
    fs.writeFileSync(placeholderVideo, '');
    console.log('Created placeholder video file');
  } catch (err) {
    console.error('Error creating placeholder video:', err);
  }
}

// Add a route to handle fallback for missing stylesheets
app.get('*.css', (req, res, next) => {
  // If the requested CSS file doesn't exist, serve a default one
  const requestedPath = path.join(__dirname, req.path);
  if (!fs.existsSync(requestedPath)) {
    console.log(`CSS file not found: ${req.path}, serving fallback`);
    res.setHeader('Content-Type', 'text/css');
    return res.sendFile(path.join(__dirname, 'public', 'styles', 'main.css'));
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
      messages: []
    };
  }
};

// Utility function to ensure HTML content preserves line breaks
const ensureProperHtmlFormatting = (content) => {
  if (!content) return '';
  
  // If content already has HTML formatting, return as is
  if (content.includes('<p>') || content.includes('<br') || content.includes('<div')) {
    return content;
  }
  
  // Otherwise, convert line breaks to <br> tags
  return content
    .split('\n\n')
    .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');
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

// Products routes
app.get('/api/products', (req, res) => {
  const db = getDatabase();
  res.json({ 
    statusCode: 200,
    message: 'Success', 
    data: db.products || [] 
  });
});

app.get('/api/san-pham', (req, res) => {
  const db = getDatabase();
  res.json({ 
    statusCode: 200,
    message: 'Success',
    data: db.products || [] 
  });
});

// News routes
app.get('/api/news', (req, res) => {
  const db = getDatabase();
  res.json({ 
    statusCode: 200,
    message: 'Success',
    data: db.news || [] 
  });
});

// Images routes
app.get('/api/images', (req, res) => {
  const db = getDatabase();
  res.json({ 
    statusCode: 200,
    message: 'Success',
    data: db.images || [] 
  });
});

// Videos routes
app.get('/api/videos', (req, res) => {
  const db = getDatabase();
  res.json({ 
    statusCode: 200,
    message: 'Success',
    data: db.videos || [] 
  });
});

// Services routes
app.get('/api/services', (req, res) => {
  const db = getDatabase();
  res.json({ 
    statusCode: 200,
    message: 'Success',
    data: db.services || [] 
  });
});

app.get('/api/san-xuat', (req, res) => {
  const db = getDatabase();
  res.json({ 
    statusCode: 200,
    message: 'Success',
    data: db.services || [] 
  });
});

// Teams routes
app.get('/api/teams', (req, res) => {
  const db = getDatabase();
  res.json({ 
    statusCode: 200,
    message: 'Success',
    data: db.team || [] 
  });
});

// Get team member by ID
app.get('/api/teams/:id', (req, res) => {
  const db = getDatabase();
  const id = req.params.id;
  let member = db.team ? db.team.find(m => m.id.toString() === id) : null;
  
  if (!member) {
    return res.status(404).json({
      statusCode: 404,
      message: 'Team member not found',
      data: null
    });
  }
  
  // Use the original image paths from database
  res.json({
    statusCode: 200,
    message: 'Success',
    data: member
  });
});

// Navigation routes
app.get('/api/parent-navs/all-with-child', (req, res) => {
  const db = getDatabase();
  res.json({
    statusCode: 200,
    message: 'Success',
    data: db.navigation || []
  });
});

// Add route for parent-nav-che endpoint
app.get('/api/parent-nav-che=:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const navigation = db.navigation || [];
  
  // Find the navigation item by ID (potentially in format ID:1)
  const navItem = navigation.find(nav => {
    const navId = id.includes(':') ? id.split(':')[0] : id;
    return nav.id.toString() === navId;
  });
  
  if (navItem) {
    res.json({
      statusCode: 200,
      message: 'Success',
      data: navItem
    });
  } else {
    res.status(404).json({
      statusCode: 404,
      message: 'Navigation item not found'
    });
  }
});

// Add a more flexible route that matches the pattern in the errors
app.get('/api/parent-nav-che*', (req, res) => {
  // Extract the ID from the URL
  const urlParts = req.path.split('=');
  if (urlParts.length < 2) {
    return res.status(404).json({
      statusCode: 404,
      message: 'Invalid navigation item request'
    });
  }
  
  const idPart = urlParts[1]; // This would be something like 1747805387251:1
  const navId = idPart.includes(':') ? idPart.split(':')[0] : idPart;
  
  const db = getDatabase();
  const navigation = db.navigation || [];
  
  // Try to find by ID
  const navItem = navigation.find(nav => nav.id.toString() === navId.toString());
  
  if (navItem) {
    res.json({
      statusCode: 200,
      message: 'Success',
      data: navItem
    });
  } else {
    res.status(404).json({
      statusCode: 404,
      message: 'Navigation item not found'
    });
  }
});

app.get('/api/navigation-links', (req, res) => {
  const db = getDatabase();
  res.json(db.navigation || []);
});

// Add a specific endpoint to get service categories with our custom categories
app.get('/api/parent-navs/slug/dich-vu', (req, res) => {
  try {
    const serviceCategories = [
      {
        id: "gao-huu-co-lien-nhat",
        title: "Gạo Hữu Cơ Liên Nhật",
        slug: "gao-huu-co-lien-nhat",
        position: 1
      },
      {
        id: "ca-ro-dong",
        title: "Cá Rô Đồng",
        slug: "ca-ro-dong",
        position: 2
      },
      {
        id: "tom-cang-xanh",
        title: "Tôm Càng Xanh",
        slug: "tom-cang-xanh",
        position: 3
      },
      {
        id: "oc-buou",
        title: "Ốc Bươu",
        slug: "oc-buou",
        position: 4
      }
    ];
    
    res.json({
      statusCode: 200,
      message: 'Success',
      data: serviceCategories
    });
  } catch (error) {
    console.error('Error fetching service categories:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Error fetching service categories'
    });
  }
});

// Update the generic parent-navs/slug endpoint to include our custom handling
app.get('/api/parent-navs/slug/:slug', (req, res) => {
  const slug = req.params.slug;
  
  // Special handling for our dich-vu slug
  if (slug === 'dich-vu') {
    // Redirect to our custom endpoint
    return res.redirect('/api/parent-navs/slug/dich-vu');
  }
  
  const db = getDatabase();
  const parentNav = db.navigation ? db.navigation.find(nav => nav.slug === slug) : null;
  
  if (parentNav) {
    res.json({
      statusCode: 200,
      message: 'Success',
      data: parentNav.children || []
    });
  } else {
    res.status(404).json({
      statusCode: 404,
      message: 'Parent navigation not found'
    });
  }
});

// Categories routes
app.get('/api/categories/for-san-pham', (req, res) => {
  const db = getDatabase();
  // Extract unique categories from products
  let categories = [];
  if (db.products && db.products.length > 0) {
    categories = [...new Set(db.products.map(product => product.child_nav_id))]
      .filter(Boolean) // Filter out null/undefined values
      .map(id => ({
        id,
        name: id, // Use ID as name if no better option
        slug: id
      }));
  }
  
  res.json({
    statusCode: 200,
    message: 'Success',
    data: categories
  });
});

app.get('/api/categories/for-san-xuat', (req, res) => {
  const db = getDatabase();
  // Extract unique categories from services
  let categories = [];
  if (db.services && db.services.length > 0) {
    categories = [...new Set(db.services.map(service => service.child_nav_id))]
      .filter(Boolean) // Filter out null/undefined values
      .map(id => ({
        id,
        name: id, // Use ID as name if no better option
        slug: id
      }));
  }
  
  res.json({
    statusCode: 200,
    message: 'Success',
    data: categories
  });
});

app.get('/api/categories/:slug', (req, res) => {
  const { slug } = req.params;
  const db = getDatabase();
  
  let categoryData = [];
  if (slug === 'san-pham' && db.productCategories) {
    categoryData = db.productCategories;
  } else if (slug === 'san-xuat' && db.serviceCategories) {
    categoryData = db.serviceCategories;
  } else if (slug === 'tin-tuc' && db.newsCategories) {
    categoryData = db.newsCategories;
  }
  
  res.json({
    statusCode: 200,
    message: 'Success',
    data: categoryData
  });
});

// Get categories for specific product type (e.g., san-pham)
app.get('/api/categories/for-:type', (req, res) => {
  const { type } = req.params;
  const db = getDatabase();
  let categories = [];
  
  try {
    if (type === 'san-pham' && db.products) {
      // Extract categories from products based on type and child_nav_id
      categories = [...new Set(db.products
        .filter(product => product.type === 'san-pham' && product.child_nav_id)
        .map(product => product.child_nav_id))]
        .map(id => ({
          id,
          name: id, // Use ID as name if no better name is available
          slug: id
        }));
    } else if (type === 'san-xuat' && db.services) {
      // Extract categories from services
      categories = [...new Set(db.services
        .filter(service => service.type === 'san-xuat' && service.child_nav_id)
        .map(service => service.child_nav_id))]
        .map(id => ({
          id,
          name: id,
          slug: id
        }));
    }

    res.json({
      statusCode: 200,
      message: 'Success',
      data: categories
    });
  } catch (error) {
    console.error(`Error processing categories for ${type}:`, error);
    res.status(500).json({
      statusCode: 500,
      message: `Error processing categories for ${type}: ${error.message}`
    });
  }
});

// Specific route for fetching categories for a certain type
app.get('/api/categories/for-:type/falling-back-to-database.json', (req, res) => {
  const { type } = req.params;
  const db = getDatabase();
  
  try {
    let categories = [];
    
    if (type === 'san-pham' && db.products) {
      // Extract categories from products
      categories = [...new Set(db.products
        .filter(product => product.child_nav_id)
        .map(product => product.child_nav_id))]
        .map(id => ({
          id,
          name: id,
          slug: id
        }));
    } else if (type === 'san-xuat' && db.services) {
      // Extract categories from services
      categories = [...new Set(db.services
        .filter(service => service.child_nav_id)
        .map(service => service.child_nav_id))]
        .map(id => ({
          id,
          name: id,
          slug: id
        }));
    }
    
    res.json({
      statusCode: 200,
      message: 'Success',
      data: categories
    });
  } catch (error) {
    console.error(`Error processing fallback categories for ${type}:`, error);
    res.status(500).json({
      statusCode: 500,
      message: `Error processing fallback categories for ${type}: ${error.message}`
    });
  }
});

// Database path
const DB_PATH = path.join(__dirname, 'api/database.json');

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

// File upload endpoint
app.post('/api/upload/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        statusCode: 400,
        message: 'No file uploaded'
      });
    }
    
    const fileUrlPath = `/images/uploads/${req.file.filename}`;
    const absoluteUrlPath = `http://localhost:${PORT}${fileUrlPath}`;
    
    res.json({
      statusCode: 200,
      message: 'File uploaded successfully',
      data: {
        url: fileUrlPath,
        absoluteUrl: absoluteUrlPath,
        originalname: req.file.originalname,
        filename: req.file.filename
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
      // Handle team images that might be requested from root path without /images/teams/ prefix
      const filename = path.basename(req.path);
      if (filename === 'gd.jpg' || filename === 'quynh.jpg') {
        const teamImagePath = path.join(__dirname, 'images', 'teams', filename);
        if (fs.existsSync(teamImagePath)) {
          console.log(`Team image found at correct path: ${teamImagePath}`);
          return res.sendFile(teamImagePath);
        }
      }
      
      // Special handling for team member images
      if (req.path.includes('/images/teams/')) {
        const placeholderImage = path.join(__dirname, 'public', 'images', 'placeholder.jpg');
        if (fs.existsSync(placeholderImage)) {
          console.log(`Team image not found: ${req.path}, serving placeholder`);
          return res.sendFile(placeholderImage);
        }
      }
      
      const uploadsPaths = [
        path.join(__dirname, 'uploads', filename),
        path.join(__dirname, 'images', 'uploads', filename),
        path.join(__dirname, 'public', 'images', 'uploads', filename)
      ];
      
      for (const uploadPath of uploadsPaths) {
        if (fs.existsSync(uploadPath)) {
          console.log(`Found image in: ${uploadPath}`);
          return res.sendFile(uploadPath);
        }
      }
      
      const fallbackImage = path.join(__dirname, 'public', 'images', 'placeholder.jpg');
      if (fs.existsSync(fallbackImage)) {
        return res.sendFile(fallbackImage);
      }
    }
  }
  next();
});

// Improved route prioritization for API endpoints
app.get('/api/experiences/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const experience = db.experiences ? db.experiences.find(exp => exp.id.toString() === id) : null;
  
  if (experience) {
    res.json({
      statusCode: 200,
      message: 'Success',
      data: experience
    });
  } else {
    res.status(404).json({
      statusCode: 404,
      message: 'Experience not found'
    });
  }
});

// Get featured experiences
app.get('/api/experiences/featured', (req, res) => {
  const db = getDatabase();
  const featuredExperiences = db.experiences ? db.experiences.filter(exp => exp.isFeatured) : [];
  
  res.json({
    statusCode: 200,
    message: 'Success',
    data: featuredExperiences
  });
});

// Specific handler for the URL with query parameter ID
app.get('/api/experiences', (req, res) => {
  const db = getDatabase();
  
  // Handle any query parameter, including timestamps
  if (req.query && Object.keys(req.query).length > 0) {
    // If there's an ID parameter
    if (req.query.id) {
      const id = req.query.id;
      const experience = db.experiences ? db.experiences.find(exp => exp.id.toString() === id) : null;
      
      if (experience) {
        return res.json({
          statusCode: 200,
          message: 'Success',
          data: experience
        });
      } else {
        return res.status(404).json({
          statusCode: 404,
          message: 'Experience not found'
        });
      }
    }
    
    // For timestamp or any other parameter, just return all experiences
    return res.json({ 
      statusCode: 200,
      message: 'Success',
      data: db.experiences || []
    });
  }
  
  // If no parameters provided, return all experiences
  res.json({ 
    statusCode: 200,
    message: 'Success',
    data: db.experiences || []
  });
});

// Existing generic experiences route
app.get('/api/experiences*', (req, res) => {
  const db = getDatabase();
  res.json({ 
    statusCode: 200,
    message: 'Success',
    data: db.experiences || [] 
  });
});

// Videos routes with improved handling
app.get('/videos', (req, res) => {
  if (req.query && Object.keys(req.query).length > 0) {
    return res.json({
      statusCode: 200,
      message: 'Success',
      data: getDatabase().videos || []
    });
  }
  res.redirect('/api/videos');
});

app.get('/videos/', (req, res) => {
  res.redirect('/api/videos');
});

// Images routes with improved handling
app.get('/images', (req, res) => {
  if (req.query && Object.keys(req.query).length > 0) {
    return res.json({
      statusCode: 200,
      message: 'Success',
      data: getDatabase().images || []
    });
  }
  res.redirect('/api/images');
});

app.get('/images/', (req, res) => {
  res.redirect('/api/images');
});

// Videos routes with support for query parameters
app.get('/api/videos', (req, res) => {
  const db = getDatabase();
  res.json({
    statusCode: 200,
    message: 'Success',
    data: db.videos || [] 
  });
});

// Handle videos with any query string
app.get('/api/videos*', (req, res) => {
  const db = getDatabase();
  res.json({
    statusCode: 200,
    message: 'Success',
    data: db.videos || [] 
  });
});

// Handle specific video by ID
app.get('/api/videos/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const video = db.videos ? db.videos.find(v => v.id.toString() === id) : null;
  
  if (video) {
    res.json({
      statusCode: 200,
      message: 'Success',
      data: video
    });
  } else {
    res.status(404).json({
      statusCode: 404,
      message: 'Video not found'
    });
  }
});

// Route to handle direct video URL access
app.get('/videos/:videoId', (req, res) => {
  const videoId = req.params.videoId;
  // First try to serve from videos directory
  const videoPath = path.join(VIDEOS_DIR, videoId);
  
  if (fs.existsSync(videoPath)) {
    return res.sendFile(videoPath);
  }
  
  // Fall back to placeholder
  res.sendFile(placeholderVideo);
});

// Special handling for URLs that end with ? or have query parameters
app.get('/videos/*', (req, res) => {
  // Parse the path and extract the filename
  const urlPath = req.path;
  const pathParts = urlPath.split('/');
  const lastPart = pathParts[pathParts.length - 1];
  
  // Handle query parameters by splitting at ?
  const fileName = lastPart.split('?')[0]; 
  
  // Check if this is a numeric ID with underscore prefix (like ?_=1747884993507)
  if (req.query && req.query._) {
    return res.json({
      statusCode: 200,
      message: 'Success',
      data: getDatabase().videos || []
    });
  }
  
  if (fileName) {
    // Try finding the video in videos directory
    const videoPath = path.join(VIDEOS_DIR, fileName);
    if (fs.existsSync(videoPath)) {
      return res.sendFile(videoPath);
    }
  }
  
  res.redirect('/api/videos');
});

app.get('/images/*', (req, res) => {
  // Parse the path and extract the filename
  const urlPath = req.path;
  const pathParts = urlPath.split('/');
  const lastPart = pathParts[pathParts.length - 1];
  
  // Handle query parameters by splitting at ?
  const fileName = lastPart.split('?')[0]; 
  
  // Check if this is a numeric ID with underscore prefix (like ?_=1747884993507)
  if (req.query && req.query._) {
    return res.json({
      statusCode: 200,
      message: 'Success',
      data: getDatabase().images || []
    });
  }
  
  if (fileName) {
    // Try finding the image in various directories
    const imagePaths = [
      path.join(__dirname, 'images', 'uploads', fileName),
      path.join(__dirname, 'images', fileName),
      path.join(__dirname, 'public', 'images', fileName)
    ];
    
    for (const imagePath of imagePaths) {
      if (fs.existsSync(imagePath)) {
        return res.sendFile(imagePath);
      }
    }
  }
  
  res.redirect('/api/images');
});

// Add route for experience_6x (single experience with 6x suffix)
app.get('/api/experience_6x', (req, res) => {
  const db = getDatabase();
  // Return the first experience or an empty object
  const experience = db.experiences && db.experiences.length > 0 ? db.experiences[0] : {};
  res.json({ 
    statusCode: 200,
    message: 'Success',
    data: experience
  });
});

// Handle all URL variants for experience_6x including with query params
app.get('/api/experience_6x*', (req, res) => {
  const db = getDatabase();
  // Return the first experience or an empty object
  const experience = db.experiences && db.experiences.length > 0 ? db.experiences[0] : {};
  res.json({ 
    statusCode: 200,
    message: 'Success',
    data: experience
  });
});

// Add CORS status endpoint for debugging
app.get('/api/cors-status', (req, res) => {
  const origin = req.get('Origin') || 'no-origin';
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'https://thontrangliennhat.com',
    'https://www.thontrangliennhat.com',
    'https://thontrangliennhat-api.vercel.app',
    'https://api.thontrangliennhat.com'
  ];
  
  res.json({
    statusCode: 200,
    message: 'CORS Status Check',
    data: {
      origin: origin,
      isAllowed: allowedOrigins.includes(origin) || !origin,
      allowedOrigins: allowedOrigins,
      headers: {
        'Access-Control-Allow-Origin': res.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': res.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': res.get('Access-Control-Allow-Headers'),
        'Access-Control-Allow-Credentials': res.get('Access-Control-Allow-Credentials')
      },
      timestamp: new Date().toISOString()
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const db = getDatabase();
  res.json({
    statusCode: 200,
    message: 'API Server is running',
    data: {
      server: 'thontrangliennhat2-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: db ? 'connected' : 'error',
        collections: db ? Object.keys(db) : []
      },
      endpoints: [
        '/api/products',
        '/api/services', 
        '/api/news',
        '/api/teams',
        '/api/images',
        '/api/videos',
        '/api/experiences',
        '/api/contact',
        '/api/cors-status',
        '/api/health'
      ]
    }
  });
});

// Add a catch-all handler for any remaining API routes
app.get('/api/*', (req, res) => {
  console.log(`Catch-all handler for: ${req.originalUrl}`);
  
  // Try to determine the type of data being requested
  const path = req.originalUrl.toLowerCase();
  const db = getDatabase();
  
  // Handle parent-nav-che requests that might not have been caught by specific routes
  if (path.includes('parent-nav-che')) {
    const urlParts = path.split('=');
    if (urlParts.length >= 2) {
      const idPart = urlParts[1].split('?')[0]; // Get ID part without query params
      const navId = idPart.includes(':') ? idPart.split(':')[0] : idPart;
      
      const navItem = db.navigation ? db.navigation.find(nav => 
        nav.id.toString() === navId.toString()) : null;
      
      if (navItem) {
        return res.json({
          statusCode: 200,
          message: 'Success from catch-all',
          data: navItem
        });
      }
    }
  }
  
  // Handle categories for specific types
  if (path.includes('categories/for-')) {
    const typeMatch = path.match(/categories\/for-([\w-]+)/);
    if (typeMatch && typeMatch[1]) {
      const type = typeMatch[1];
      
      let categories = [];
      if (type === 'san-pham' && db.products) {
        categories = [...new Set(db.products
          .filter(product => product.child_nav_id)
          .map(product => product.child_nav_id))]
          .filter(Boolean)
          .map(id => ({
            id,
            name: id,
            slug: id
          }));
      } else if (type === 'san-xuat' && db.services) {
        categories = [...new Set(db.services
          .filter(service => service.child_nav_id)
          .map(service => service.child_nav_id))]
          .filter(Boolean)
          .map(id => ({
            id,
            name: id,
            slug: id
          }));
      }
      
      return res.json({
        statusCode: 200,
        message: 'Success from catch-all',
        data: categories
      });
    }
  }
  
  if (path.includes('experience') || path.includes('trai-nghiem')) {
    return res.json({
      statusCode: 200,
      message: 'Success from catch-all',
      data: db.experiences || []
    });
  } else if (path.includes('video')) {
    return res.json({
      statusCode: 200,
      message: 'Success from catch-all',
      data: db.videos || []
    });
  } else if (path.includes('product') || path.includes('san-pham')) {
    return res.json({
      statusCode: 200,
      message: 'Success from catch-all',
      data: db.products || []
    });
  } else if (path.includes('service') || path.includes('san-xuat')) {
    return res.json({
      statusCode: 200,
      message: 'Success from catch-all',
      data: db.services || []
    });
  } else if (path.includes('news') || path.includes('tin-tuc')) {
    return res.json({
      statusCode: 200,
      message: 'Success from catch-all',
      data: db.news || []
    });
  }
  
  // Default response if no matching type
  res.status(404).json({
    statusCode: 404,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Custom 404 handler for API routes - this should be last
app.use('/api/*', (req, res) => {
  console.log(`404 API route not found: ${req.originalUrl}`);
  res.status(404).json({
    statusCode: 404,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Add routes for individual products
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const product = db.products ? db.products.find(p => p.id.toString() === id) : null;
  
  if (product) {
    // Ensure all string fields are properly strings
    const safeProduct = { ...product };
    Object.keys(safeProduct).forEach(key => {
      // If value is undefined or null, convert to empty string for string fields
      if (safeProduct[key] === undefined || safeProduct[key] === null) {
        if (['name', 'title', 'slug', 'summary', 'content', 'description'].includes(key)) {
          safeProduct[key] = '';
        }
      }
    });
    
    res.json({
      statusCode: 200,
      message: 'Success',
      data: safeProduct
    });
  } else {
    res.status(404).json({
      statusCode: 404,
      message: 'Product not found'
    });
  }
});

// Add a route for product details with type path
app.get('/api/san-pham/:slug', (req, res) => {
  const { slug } = req.params;
  const db = getDatabase();
  const product = db.products ? db.products.find(p => p.slug === slug) : null;
  
  if (product) {
    // Ensure all string fields are properly strings
    const safeProduct = { ...product };
    Object.keys(safeProduct).forEach(key => {
      // If value is undefined or null, convert to empty string for string fields
      if (safeProduct[key] === undefined || safeProduct[key] === null) {
        if (['name', 'title', 'slug', 'summary', 'content', 'description'].includes(key)) {
          safeProduct[key] = '';
        }
      }
    });
    
    res.json({
      statusCode: 200,
      message: 'Success',
      data: safeProduct
    });
  } else {
    res.status(404).json({
      statusCode: 404,
      message: 'Product not found'
    });
  }
});

// Add routes for individual services
app.get('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const service = db.services ? db.services.find(s => s.id.toString() === id) : null;
  
  if (service) {
    // Ensure all string fields are properly strings
    const safeService = { ...service };
    Object.keys(safeService).forEach(key => {
      // If value is undefined or null, convert to empty string for string fields
      if (safeService[key] === undefined || safeService[key] === null) {
        if (['name', 'title', 'slug', 'summary', 'content', 'description'].includes(key)) {
          safeService[key] = '';
        }
      }
    });
    
    res.json({
      statusCode: 200,
      message: 'Success',
      data: safeService
    });
  } else {
    res.status(404).json({
      statusCode: 404,
      message: 'Service not found'
    });
  }
});

// Add a generic handler for POST requests to services with any suffix
app.post('/api/services*', upload.array('images[]'), (req, res) => {
  try {
    // Log request info for debugging
    console.log('POST /api/services* request received');
    console.log('Request path:', req.path);
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('Request files:', req.files ? req.files.length : 'No files');
    
    // Check if this is a PUT method override for a specific ID
    const methodOverride = req.body._method;
    const serviceId = req.params.id || req.path.split('/').pop();
    
    if (methodOverride && methodOverride.toLowerCase() === 'put' && serviceId) {
      console.log('Detected PUT method override for service ID:', serviceId);
      
      if (isNaN(parseInt(serviceId))) {
        console.error('Invalid service ID:', serviceId);
        return res.status(400).json({
          statusCode: 400,
          message: 'Invalid service ID',
          data: null
        });
      }

      const db = getDatabase();
      if (!db || !db.services) {
        console.error('Database or services array is undefined');
        return res.status(500).json({
          statusCode: 500, 
          message: 'Database error',
          data: null
        });
      }
      
      // Find the service to update
      const serviceIndex = db.services.findIndex(service => service.id.toString() === serviceId.toString());
      console.log(`Service index for ID ${serviceId}:`, serviceIndex);
      
      if (serviceIndex === -1) {
        return res.status(404).json({
          statusCode: 404,
          message: 'Service not found',
          data: null
        });
      }
      
      // Get the current service
      const currentService = db.services[serviceIndex];
      console.log('Current service:', currentService.name);
      
      // Process uploaded files if any
      let imagesToUse = currentService.images || [];
      
      if (req.files && req.files.length > 0) {
        // New files were uploaded
        const uploadedImages = req.files.map(file => `/images/uploads/${file.filename}`);
        console.log('Uploaded new images:', uploadedImages);
        imagesToUse = uploadedImages;
      } else if (req.body['images[]'] && typeof req.body['images[]'] === 'string') {
        // Use the existing image path that was passed back
        imagesToUse = [req.body['images[]']];
        console.log('Using existing image path:', imagesToUse);
      }
      
      // Update service with new data
      const updatedService = {
        ...currentService,
        name: req.body.name || currentService.name,
        title: req.body.name || currentService.title, // Keep title in sync with name
        summary: req.body.summary || currentService.summary,
        content: ensureProperHtmlFormatting(req.body.content) || currentService.content,
        child_nav_id: req.body.child_nav_id || currentService.child_nav_id,
        categoryId: req.body.child_nav_id || currentService.categoryId,
        isFeatured: req.body.isFeatured === "true" || req.body.isFeatured === true,
        images: imagesToUse,
        image: imagesToUse[0] || currentService.image, // Set first image as main image
        updated_at: new Date().toISOString()
      };
      
      console.log('Updated service:', updatedService.name);
      console.log('Images after update:', updatedService.images);
      
      // Update the service in the database
      db.services[serviceIndex] = updatedService;
      
      // Save the database
      if (writeDatabase(db)) {
        console.log('Service updated successfully');
        return res.json({
          statusCode: 200,
          message: 'Service updated successfully',
          data: updatedService
        });
      } else {
        console.error('Failed to write to database');
        return res.status(500).json({
          statusCode: 500,
          message: 'Failed to update service',
          data: null
        });
      }
    } else {
      // If not a method override, handle as a create request or return error
      return res.status(400).json({
        statusCode: 400,
        message: 'Invalid request. For updates, use PUT or add _method=PUT for method override.',
        data: null
      });
    }
  } catch (error) {
    console.error('Error in POST service handler:', error);
    res.status(500).json({
      statusCode: 500,
      message: `Error handling service request: ${error.message}`,
      data: null
    });
  }
});

// Add a route for service details with type path
app.get('/api/san-xuat/:slug', (req, res) => {
  const { slug } = req.params;
  const db = getDatabase();
  const service = db.services ? db.services.find(s => s.slug === slug) : null;
  
  if (service) {
    // Ensure all string fields are properly strings
    const safeService = { ...service };
    Object.keys(safeService).forEach(key => {
      // If value is undefined or null, convert to empty string for string fields
      if (safeService[key] === undefined || safeService[key] === null) {
        if (['name', 'title', 'slug', 'summary', 'content', 'description'].includes(key)) {
          safeService[key] = '';
        }
      }
    });
    
    res.json({
      statusCode: 200,
      message: 'Success',
      data: safeService
    });
  } else {
    res.status(404).json({
      statusCode: 404,
      message: 'Service not found'
    });
  }
});

// Add a route for product details with nested paths like /san-pham/san-pham/3
app.get('/api/:type/:subtype/:id', (req, res) => {
  const { type, subtype, id } = req.params;
  const db = getDatabase();
  
  // Handle products
  if (type === 'san-pham' || subtype === 'san-pham') {
    const product = db.products ? db.products.find(p => p.id.toString() === id) : null;
    
    if (product) {
      // Ensure all string fields are properly strings
      const safeProduct = { ...product };
      Object.keys(safeProduct).forEach(key => {
        if (safeProduct[key] === undefined || safeProduct[key] === null) {
          if (['name', 'title', 'slug', 'summary', 'content', 'description'].includes(key)) {
            safeProduct[key] = '';
          }
        }
      });
      
      return res.json({
        statusCode: 200,
        message: 'Success',
        data: safeProduct
      });
    }
  }
  
  // Handle services
  if (type === 'san-xuat' || subtype === 'san-xuat') {
    const service = db.services ? db.services.find(s => s.id.toString() === id) : null;
    
    if (service) {
      // Ensure all string fields are properly strings
      const safeService = { ...service };
      Object.keys(safeService).forEach(key => {
        if (safeService[key] === undefined || safeService[key] === null) {
          if (['name', 'title', 'slug', 'summary', 'content', 'description'].includes(key)) {
            safeService[key] = '';
          }
        }
      });
      
      return res.json({
        statusCode: 200,
        message: 'Success',
        data: safeService
      });
    }
  }
  
  // If we reach here, no matching item was found
  res.status(404).json({
    statusCode: 404,
    message: 'Item not found'
  });
});

// Add a generic handler for experience_66 type endpoints (handle the pattern seen in errors)
app.get('/api/experience_:id', (req, res) => {
  const experienceId = req.params.id;
  console.log(`Handling request for experience with numeric ID: ${experienceId}`);
  
  // Check if there's a timestamp or other query parameter
  const queryParams = Object.keys(req.query);
  let lookupId = experienceId;
  
  if (queryParams.length > 0) {
    // If the query includes an ID (like _=1747887...), use that instead
    for (const param of queryParams) {
      if (param !== '_' && param !== 'nocache') {
        lookupId = param;
        break;
      }
    }
  }
  
  const db = getDatabase();
  const experience = db.experiences ? db.experiences.find(exp => exp.id.toString() === lookupId) : null;
  
  if (experience) {
    res.json({
      statusCode: 200,
      message: 'Success',
      data: experience
    });
  } else {
    // If not found, return the first experience as fallback
    const fallbackExperience = db.experiences && db.experiences.length > 0 ? db.experiences[0] : null;
    
    if (fallbackExperience) {
      console.log(`Experience ${lookupId} not found, returning fallback experience`);
      res.json({
        statusCode: 200,
        message: 'Success (fallback)',
        data: fallbackExperience
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: 'Experience not found'
      });
    }
  }
});

// Add a handler for videos with ID parameter
app.get('/api/videos', (req, res) => {
  const db = getDatabase();
  
  // Check if there's an ID in the query parameters
  if (req.query && Object.keys(req.query).length > 0) {
    // Look for ID parameter in query
    for (const param in req.query) {
      if (param !== '_' && param !== 'nocache') {
        const videoId = req.query[param];
        console.log(`Looking for video with ID ${videoId}`);
        
        // Try to find the video
        const video = db.videos ? db.videos.find(v => v.id.toString() === videoId.toString()) : null;
        
        if (video) {
          return res.json({
            statusCode: 200,
            message: 'Success',
            data: video
          });
        }
      }
    }
  }
  
  // If no specific video is found or requested, return all videos
  res.json({
    statusCode: 200,
    message: 'Success',
    data: db.videos || [] 
  });
});

// Add a handler for images with ID parameter
app.get('/api/images', (req, res) => {
  const db = getDatabase();
  
  // Check if there's an ID in the query parameters
  if (req.query && Object.keys(req.query).length > 0) {
    // Look for ID parameter in query
    for (const param in req.query) {
      if (param !== '_' && param !== 'nocache') {
        const imageId = req.query[param];
        console.log(`Looking for image with ID ${imageId}`);
        
        // Try to find the image
        const image = db.images ? db.images.find(img => img.id.toString() === imageId.toString()) : null;
        
        if (image) {
          return res.json({
            statusCode: 200,
            message: 'Success',
            data: image
          });
        }
      }
    }
  }
  
  // If no specific image is found or requested, return all images
  res.json({
    statusCode: 200,
    message: 'Success',
    data: db.images || [] 
  });
});

// Better handler for /api/experiences with query parameters
app.get('/api/experiences', (req, res) => {
  const db = getDatabase();
  
  // If there are query parameters (excluding cache-busting parameters)
  if (req.query && Object.keys(req.query).length > 0) {
    const nonCacheParams = Object.keys(req.query).filter(key => key !== '_' && key !== 'nocache');
    
    // If there are meaningful query parameters
    if (nonCacheParams.length > 0) {
      // Look for experiences by those parameters
      for (const param of nonCacheParams) {
        const value = req.query[param];
        console.log(`Looking for experiences with ${param}=${value}`);
        
        // Try to find experiences with matching parameter
        const experience = db.experiences ? 
          db.experiences.find(exp => 
            exp[param] ? exp[param].toString() === value.toString() : 
            exp.id ? exp.id.toString() === value.toString() : false
          ) : null;
        
        if (experience) {
          return res.json({
            statusCode: 200,
            message: 'Success',
            data: experience
          });
        }
      }
    }
  }
  
  // If no specific experiences found or no meaningful parameters, return all experiences
  res.json({
    statusCode: 200,
    message: 'Success',
    data: db.experiences || []
  });
});

// Add a catch-all handler for any API route to provide helpful error messages
app.get('/api/*', (req, res) => {
  console.log(`Catch-all handler for: ${req.path}`);
  
  // Determine what resource is being requested
  const path = req.path.toLowerCase();
  const db = getDatabase();
  
  if (path.includes('experience') && db.experiences) {
    res.json({
      statusCode: 200,
      message: 'Success (fallback from catch-all)',
      data: db.experiences[0] || null
    });
  } else if (path.includes('video') && db.videos) {
    res.json({
      statusCode: 200,
      message: 'Success (fallback from catch-all)',
      data: db.videos || []
    });
  } else if (path.includes('image') && db.images) {
    res.json({
      statusCode: 200,
      message: 'Success (fallback from catch-all)',
      data: db.images || []
    });
  } else if (path.includes('product') && db.products) {
    res.json({
      statusCode: 200,
      message: 'Success (fallback from catch-all)',
      data: db.products || []
    });
  } else if (path.includes('service') && db.services) {
    res.json({
      statusCode: 200,
      message: 'Success (fallback from catch-all)',
      data: db.services || []
    });
  } else {
    res.status(404).json({
      statusCode: 404,
      message: `Resource not found: ${req.path}`,
      suggestion: 'Available endpoints: /api/products, /api/services, /api/experiences, /api/videos, /api/images'
    });
  }
});

// Contact routes - Get all messages
app.get('/api/contact', (req, res) => {
  const db = getDatabase();
  const limit = req.query.limit ? parseInt(req.query.limit) : null;
  
  // Ensure messages array exists
  const messages = db.messages || [];
  
  // Apply limit if specified
  const data = limit ? messages.slice(0, limit) : messages;
  
  res.json({
    statusCode: 200,
    message: 'Success',
    data: data
  });
});

// Contact routes - Create a new message
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, phone, title, content } = req.body;
    
    // Validate required fields
    if (!name || !email || !content) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Name, email, and content are required',
        data: null
      });
    }
    
    const db = getDatabase();
    
    // Ensure messages array exists
    if (!db.messages) {
      db.messages = [];
    }
    
    // Create new message
    const newMessage = {
      _id: Date.now().toString(),
      name,
      email,
      phone: phone || '',
      title: title || '',
      content,
      created_at: new Date().toISOString()
    };
    
    // Add to database
    db.messages.unshift(newMessage);  // Add to beginning of array
    
    // Save database
    if (writeDatabase(db)) {
      res.status(201).json({
        statusCode: 201,
        message: 'Message created successfully',
        data: newMessage
      });
    } else {
      res.status(500).json({
        statusCode: 500,
        message: 'Failed to save message',
        data: null
      });
    }
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      data: null
    });
  }
});

// Contact routes - Delete a message
app.delete('/api/contact/:id', (req, res) => {
  try {
    const messageId = req.params.id;
    const db = getDatabase();
    
    // Ensure messages array exists
    if (!db.messages) {
      db.messages = [];
    }
    
    // Find message index
    const messageIndex = db.messages.findIndex(m => m._id === messageId);
    
    if (messageIndex === -1) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Message not found',
        data: null
      });
    }
    
    // Remove message
    db.messages.splice(messageIndex, 1);
    
    // Save database
    if (writeDatabase(db)) {
      res.json({
        statusCode: 200,
        message: 'Message deleted successfully',
        data: null
      });
    } else {
      res.status(500).json({
        statusCode: 500,
        message: 'Failed to delete message',
        data: null
      });
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Server error',
      data: null
    });
  }
});

// Start the server (only when not on Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`Images served from: http://localhost:${PORT}/images`);
    console.log(`Videos served from: http://localhost:${PORT}/videos`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export for Vercel
module.exports = app;
