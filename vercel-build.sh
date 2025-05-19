#!/bin/bash

# Build script for Vercel deployment
echo "Starting Vercel build process..."

# Make sure database.json exists
if [ -f "database.json" ]; then
  echo "database.json exists, size: $(stat -f %z database.json 2>/dev/null || stat -c %s database.json 2>/dev/null) bytes"
  
  # Create directories if they don't exist
  mkdir -p api
  mkdir -p api/products
  mkdir -p api/services
  mkdir -p api/experiences
  mkdir -p api/news
  mkdir -p uploads
  mkdir -p images
  
  # Copy database.json to all required locations
  cp database.json api/database.json
  
  echo "Database files copied to API directories"
else
  echo "ERROR: database.json not found in root directory!"
  # Create an empty database if it doesn't exist
  echo "{\"products\":[],\"services\":[],\"experiences\":[],\"news\":[],\"syncInfo\":{\"lastSync\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}}" > database.json
  cp database.json api/database.json
  echo "Created empty database.json"
fi

# Run vercel-setup.js to prepare environment if it exists
if [ -f "vercel-setup.js" ]; then
  echo "Running vercel-setup.js..."
  node vercel-setup.js
fi

echo "Build process completed successfully"
