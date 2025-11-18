#!/bin/bash

# Sepsis Detection App - Setup Script
# This script automates the setup process for the entire application

set -e

echo "=========================================="
echo "Sepsis Detection App - Setup Script"
echo "=========================================="
echo ""

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "Python version: $python_version"
echo ""

# Check Node version
echo "Checking Node.js version..."
node_version=$(node --version)
echo "Node.js version: $node_version"
echo ""

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install
echo "Frontend dependencies installed!"
echo ""

# Generate ML models
echo "Generating ML models..."
pip install -r scripts/requirements.txt
python scripts/generate_models.py
echo "ML models generated!"
echo ""

# Setup backend
echo "Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install backend dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt
echo "Backend dependencies installed!"

cd ..
echo ""

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Start the backend (in one terminal):"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python app.py"
echo ""
echo "2. Start the frontend (in another terminal):"
echo "   export NEXT_PUBLIC_BACKEND_URL=http://localhost:5000"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
