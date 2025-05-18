#!/bin/bash

# Script to redeploy the API to Vercel

echo "Starting redeploy process..."

# Make sure the database is in place
echo "Copying database to all required locations..."
node copy-db.js

# Run CORS update script
echo "Updating CORS headers..."
node update-cors.js

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "Redeploy process complete." 