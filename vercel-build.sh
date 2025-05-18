#!/bin/bash

# Build script for Vercel deployment
echo "Starting Vercel build process..."

# Make sure database.json exists
if [ -f "database.json" ]; then
  echo "database.json exists, file size detected"
  
  # Create directories if they don't exist
  mkdir -p api
  mkdir -p api/products
  mkdir -p api/services
  mkdir -p api/experiences
  mkdir -p api/news
  mkdir -p /tmp
  
  # Copy database.json to all required locations
  cp database.json api/database.json
  cp database.json api/products/database.json
  cp database.json api/services/database.json
  cp database.json api/experiences/database.json
  cp database.json api/news/database.json
  cp database.json /tmp/database.json
  
  echo "Database files copied to API directories"
else
  echo "ERROR: database.json not found in root directory!"
  exit 1
fi

# Run vercel-setup.js to prepare environment
echo "Running vercel-setup.js..."
node vercel-setup.js

echo "Build process completed successfully" 