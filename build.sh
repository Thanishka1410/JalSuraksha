#!/bin/bash
set -e

echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Building frontend..."
REACT_APP_API_URL=/api/v1 npm run build

echo "Copying build to backend/public..."
rm -rf ../backend/public
cp -r build ../backend/public

echo "Installing backend dependencies..."
cd ../backend
npm install

echo "Build complete!"
