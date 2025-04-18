#!/bin/bash

# Install dependencies
npm install

# Initialize database
mkdir -p backend/db

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "NODE_ENV=development" > .env
  echo "PORT=5000" >> .env
  echo "JWT_SECRET=flow3secretkey123456" >> .env
  echo "BASE_PATH=/" >> .env
fi

echo "Setup complete. Run 'npm run server' to start the server."
