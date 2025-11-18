# Sepsis Detection Web App - Complete Setup Guide

This guide will help you set up and run the complete sepsis detection application with both frontend and backend.

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.8+ (for backend)
- Git

## Quick Start

### 1. Clone and Install Frontend

\`\`\`bash
# Install frontend dependencies
npm install
\`\`\`

### 2. Generate ML Models

The application includes a script to generate mock ML models for testing:

\`\`\`bash
# Install Python dependencies for model generation
pip install -r scripts/requirements.txt

# Generate the models (creates .pkl files in backend/models/)
python scripts/generate_models.py
\`\`\`

This will:
- Create synthetic training data for sepsis detection
- Train three ML models: Logistic Regression, Decision Tree, and Random Forest
- Save the trained models as pickle files
- Display performance metrics for each model

### 3. Setup Backend

\`\`\`bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py
\`\`\`

The backend will start at `http://localhost:5000`

### 4. Setup Frontend (in a new terminal)

\`\`\`bash
# Make sure you're in the root directory
# Set the backend URL environment variable
export NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Run the development server
npm run dev
\`\`\`

The frontend will start at `http://localhost:3000`

## Environment Variables

### Frontend (.env.local)

\`\`\`
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
\`\`\`

For production, update this to your deployed backend URL.

### Backend (.env)

\`\`\`
FLASK_ENV=development
FLASK_DEBUG=True
\`\`\`

## Project Structure

\`\`\`
.
├── app/                          # Next.js app directory
│   ├── page.tsx                 # Home page
│   ├── predict/page.tsx         # Prediction page
│   ├── compare/page.tsx         # Model comparison page
│   ├── about/page.tsx           # About page
│   ├── api/
│   │   ├── predict/route.ts     # Prediction API endpoint
│   │   └── metrics/route.ts     # Metrics API endpoint
│   └── layout.tsx               # Root layout
├── components/                   # React components
│   ├── prediction-form.tsx      # Patient data input form
│   ├── prediction-results.tsx   # Prediction results display
│   ├── model-metrics-table.tsx  # Metrics table
│   └── metrics-chart.tsx        # Metrics visualization
├── backend/                      # Flask backend
│   ├── app.py                   # Flask application
│   ├── models/                  # ML models directory (generated)
│   │   ├── logistic_regression.pkl
│   │   ├── decision_tree.pkl
│   │   └── random_forest.pkl
│   └── requirements.txt         # Python dependencies
├── scripts/                      # Utility scripts
│   ├── generate_models.py       # ML model training script
│   └── requirements.txt         # Script dependencies
└── package.json                 # Node.js dependencies
\`\`\`

## Features

### Frontend
- **Home Page**: Overview of the application and features
- **Prediction Page**: Input patient parameters and get sepsis risk predictions
- **Comparison Page**: View and compare performance metrics of all three models
- **About Page**: Information about the models and methodology

### Backend
- **Prediction API**: Accepts patient parameters and returns predictions from all three models
- **Metrics API**: Returns performance metrics for each model
- **Health Check**: Simple endpoint to verify backend is running

### ML Models
- **Logistic Regression**: Fast, interpretable baseline model
- **Decision Tree**: Captures non-linear relationships
- **Random Forest**: Ensemble model with best overall performance

## API Documentation

### POST /api/predict

Predict sepsis risk based on patient health parameters.

**Request:**
\`\`\`json
{
  "temperature": 38.5,
  "heart_rate": 105,
  "systolic_bp": 140,
  "diastolic_bp": 90,
  "respiratory_rate": 22,
  "wbc_count": 12.5
}
\`\`\`

**Response:**
\`\`\`json
{
  "LogisticRegression": "Sepsis Detected",
  "DecisionTree": "No Sepsis",
  "RandomForest": "Sepsis Detected",
  "FinalModel": "RandomForest",
  "FinalPrediction": "Sepsis Detected"
}
\`\`\`

### GET /api/metrics

Get model performance metrics.

**Response:**
\`\`\`json
{
  "LogisticRegression": {
    "accuracy": 0.87,
    "precision": 0.85,
    "recall": 0.89,
    "f1": 0.87
  },
  "DecisionTree": {
    "accuracy": 0.89,
    "precision": 0.88,
    "recall": 0.90,
    "f1": 0.89
  },
  "RandomForest": {
    "accuracy": 0.93,
    "precision": 0.92,
    "recall": 0.94,
    "f1": 0.93
  }
}
\`\`\`

## Deployment

### Deploy Frontend to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variable: `NEXT_PUBLIC_BACKEND_URL` with your backend URL
5. Deploy

### Deploy Backend

#### Option 1: Render

1. Create a new Web Service on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set build command: `pip install -r backend/requirements.txt`
4. Set start command: `cd backend && python app.py`
5. Deploy

#### Option 2: Railway

1. Create a new project on [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add a `Procfile` in the backend directory:
   \`\`\`
   web: cd backend && python app.py
   \`\`\`
4. Deploy

## Troubleshooting

### Models not found error
Make sure you've run `python scripts/generate_models.py` to create the model files.

### Backend connection error
- Verify the backend is running on `http://localhost:5000`
- Check that `NEXT_PUBLIC_BACKEND_URL` is set correctly
- Ensure CORS is enabled in Flask (it is by default in `app.py`)

### Port already in use
- Frontend: Change port with `npm run dev -- -p 3001`
- Backend: Change port in `backend/app.py` (line: `app.run(debug=True, port=5000)`)

## Development

### Adding a new feature

1. Create components in `components/`
2. Create pages in `app/`
3. Add API routes in `app/api/`
4. Update backend if needed in `backend/app.py`

### Running tests

\`\`\`bash
npm run lint
\`\`\`

## License

This project is for academic and clinical research purposes.
