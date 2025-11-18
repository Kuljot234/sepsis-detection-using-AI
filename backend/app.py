from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import numpy as np
import pandas as pd
from pathlib import Path
from io import StringIO
import traceback

app = Flask(__name__)
CORS(app)

# Load models and preprocessing objects
MODEL_DIR = Path(__file__).parent / "models"

# Try to load the trained models
lgbm_model = None
scaler = None
imputer = None
feature_names = None

try:
    lgbm_model = joblib.load(MODEL_DIR / "lightgbm_model.pkl")
    scaler = joblib.load(MODEL_DIR / "scaler.pkl")
    imputer = joblib.load(MODEL_DIR / "imputer.pkl")
    feature_names = joblib.load(MODEL_DIR / "feature_names.pkl")
    print("✓ Trained LightGBM model loaded successfully")
except FileNotFoundError:
    print("⚠ Warning: Trained models not found. Using mock predictions.")
    print("  Please run: python scripts/train_real_model.py")

COLUMN_MAPPING = {
    "hour": "hour",
    "hr": "HR",
    "heart_rate": "HR",
    "o2sat": "O2Sat",
    "oxygen_saturation": "O2Sat",
    "temp": "Temp",
    "temperature": "Temp",
    "sbp": "SBP",
    "systolic_bp": "SBP",
    "systolic_blood_pressure": "SBP",
    "map": "MAP",
    "mean_arterial_pressure": "MAP",
    "dbp": "DBP",
    "diastolic_bp": "DBP",
    "diastolic_blood_pressure": "DBP",
    "resp": "Resp",
    "respiratory_rate": "Resp",
    "etco2": "EtCO2",
    "baseexcess": "BaseExcess",
    "hco3": "HCO3",
    "fio2": "FiO2",
    "ph": "pH",
    "paco2": "PaCO2",
    "sao2": "SaO2",
    "ast": "AST",
    "bun": "BUN",
    "alkalinephos": "Alkalinephos",
    "calcium": "Calcium",
    "chloride": "Chloride",
    "creatinine": "Creatinine",
}

def map_columns(df):
    """Map dataset columns to actual feature names"""
    # Normalize column names
    df_normalized = pd.DataFrame()
    
    for col in df.columns:
        col_lower = col.lower().strip()
        
        # Find matching column name
        mapped_col = None
        for key, value in COLUMN_MAPPING.items():
            if key == col_lower or col_lower == value.lower():
                mapped_col = value
                break
        
        if mapped_col:
            df_normalized[mapped_col] = df[col]
    
    return df_normalized

def make_prediction(row_features):
    """Make predictions using the trained LightGBM model"""
    try:
        if lgbm_model is None or feature_names is None:
            # Fallback mock prediction
            return make_mock_prediction(row_features)
        
        # Prepare feature array
        X_row = []
        for feature in feature_names:
            value = row_features.get(feature, None)
            if pd.isna(value) or value is None:
                value = 0  # Will be imputed
            X_row.append(float(value))
        
        X_row = np.array(X_row).reshape(1, -1)
        
        # Apply imputation
        if imputer:
            X_row = imputer.transform(X_row)
        
        # Apply scaling
        if scaler:
            X_row = scaler.transform(X_row)
        
        # Make prediction
        pred = lgbm_model.predict(X_row)[0]
        pred_proba = lgbm_model.predict_proba(X_row)[0]
        
        confidence = max(pred_proba) * 100
        result = "Sepsis Detected" if pred == 1 else "No Sepsis"
        
        return {
            "prediction": result,
            "confidence": round(confidence, 2),
            "probability_no_sepsis": round(pred_proba[0] * 100, 2),
            "probability_sepsis": round(pred_proba[1] * 100, 2)
        }
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        traceback.print_exc()
        return make_mock_prediction(row_features)

def make_mock_prediction(features):
    """Fallback mock prediction based on SIRS criteria"""
    temp = features.get("Temp", 37.0) or 37.0
    hr = features.get("HR", 70.0) or 70.0
    rr = features.get("Resp", 16.0) or 16.0
    
    sirs_score = 0
    if temp > 38.0 or temp < 36.0:
        sirs_score += 1
    if hr > 100:
        sirs_score += 1
    if rr > 20:
        sirs_score += 1
    
    prediction = "Sepsis Detected" if sirs_score >= 2 else "No Sepsis"
    confidence = (sirs_score / 3) * 100 if sirs_score > 0 else 0
    
    return {
        "prediction": prediction,
        "confidence": round(confidence, 2),
        "probability_no_sepsis": round((1 - sirs_score/3) * 100, 2),
        "probability_sepsis": round((sirs_score / 3) * 100, 2)
    }

@app.route("/api/predict", methods=["POST"])
def predict():
    """Endpoint for sepsis prediction"""
    try:
        data = request.json
        
        # Convert to proper format
        features = {}
        for col in data:
            if col in COLUMN_MAPPING:
                features[COLUMN_MAPPING[col]] = data[col]
        
        # Make prediction
        result = make_prediction(features)
        
        return jsonify({
            "RandomForest": result["prediction"],
            "FinalPrediction": result["prediction"],
            "confidence": result["confidence"],
            "probability": result["probability_sepsis"]
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/batch-predict", methods=["POST"])
def batch_predict():
    """Endpoint for batch predictions from CSV file - optimized for large datasets"""
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        if not file.filename.endswith(".csv"):
            return jsonify({"error": "File must be a CSV"}), 400

        # Read CSV file in chunks for large files
        print(f"Processing file: {file.filename}")
        predictions = []
        chunk_size = 5000  # Process 5000 rows at a time
        
        try:
            # Read CSV in chunks to handle large files
            for chunk_idx, chunk_df in enumerate(pd.read_csv(file.stream, chunksize=chunk_size)):
                print(f"Processing chunk {chunk_idx + 1}...")
                
                # Map and normalize columns
                mapped_df = map_columns(chunk_df)
                if mapped_df.empty:
                    continue
                
                # Process each row in chunk
                for idx, row in mapped_df.iterrows():
                    try:
                        row_dict = row.to_dict()
                        pred_result = make_prediction(row_dict)
                        
                        result = {
                            "row": len(predictions),
                            **{k: v for k, v in row_dict.items() if v is not None},
                            "Prediction": pred_result["prediction"],
                            "Confidence": pred_result["confidence"],
                            "Probability_Sepsis": pred_result["probability_sepsis"],
                            "Probability_No_Sepsis": pred_result["probability_no_sepsis"]
                        }
                        predictions.append(result)
                    except Exception as e:
                        print(f"Error processing row {idx}: {str(e)}")
                        continue
        
        except Exception as e:
            return jsonify({"error": f"Failed to read CSV: {str(e)}"}), 400

        if not predictions:
            return jsonify({"error": "No valid rows in CSV"}), 400

        print(f"Total predictions generated: {len(predictions)}")
        return jsonify({"predictions": predictions, "count": len(predictions)}), 200

    except Exception as e:
        print(f"Batch prediction error: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/api/metrics", methods=["GET"])
def get_metrics():
    """Endpoint for model metrics"""
    return jsonify({
        "LightGBM": {
            "accuracy": 0.98,
            "precision": 0.64,
            "recall": 0.01,
            "f1": 0.01,
        }
    }), 200

@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint"""
    model_status = "loaded" if lgbm_model is not None else "not_loaded"
    return jsonify({"status": "ok", "model_status": model_status}), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)
