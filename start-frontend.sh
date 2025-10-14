#!/bin/bash

# Define the project path
PROJECT_DIR="/home/minister/Documents/CYBERSECURITY/NEXASEC/frontend"

# Navigate to the project directory
cd "$PROJECT_DIR" || {
  echo "❌ Failed to navigate to $PROJECT_DIR"
  exit 1
}

echo "📁 Current directory: $(pwd)"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install || {
        echo "❌ npm install failed"
        exit 1
    }
else
    echo "✅ Dependencies already installed"
fi

# Start the development server
echo "🚀 Starting development server..."
npm run dev
