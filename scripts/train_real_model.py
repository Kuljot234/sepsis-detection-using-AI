"""
Train LightGBM model on large sepsis dataset (optimized for 10+ lakh rows).
This script efficiently handles missing values, features scaling, and saves the model.
"""

import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
import joblib
from pathlib import Path
import warnings
import gc

warnings.filterwarnings('ignore')

# Setup paths
MODEL_DIR = Path(__file__).parent.parent / "backend" / "models"
MODEL_DIR.mkdir(exist_ok=True)

print("=" * 70)
print("TRAINING LIGHTGBM MODEL ON LARGE SEPSIS DATASET (OPTIMIZED)")
print("=" * 70)

try:
    # Load dataset in chunks for memory efficiency
    print("\n1. Loading dataset in chunks (memory-efficient)...")
    chunks = []
    chunk_size = 100000  # Process 100k rows at a time
    
    for chunk in pd.read_csv("Dataset.csv", chunksize=chunk_size):
        print(f"   Loaded {len(chunk)} rows...")
        chunks.append(chunk)
        gc.collect()  # Free memory after each chunk
    
    df = pd.concat(chunks, ignore_index=True)
    print(f"   Total dataset shape: {df.shape}")
    print(f"   Columns: {df.columns.tolist()}")
    
    # Drop unnecessary columns
    df = df.drop(columns=['Unnamed: 0', 'Patient_ID'], errors='ignore')
    print(f"   After dropping unnecessary columns: {df.shape}")
    
    # Identify target and features
    if 'SepsisLabel' not in df.columns:
        raise ValueError("Missing 'SepsisLabel' column in dataset")
    
    target = 'SepsisLabel'
    X = df.drop(columns=[target, 'ICULOS', 'Hour'], errors='ignore')
    y = df[target]
    
    print(f"\n2. Feature and target analysis...")
    print(f"   Features shape: {X.shape}")
    print(f"   Feature columns: {X.columns.tolist()}")
    print(f"   Target distribution:\n{y.value_counts()}")
    print(f"   Class ratio: {y.value_counts(normalize=True)}")
    
    # Handle missing values with median imputation
    print("\n3. Handling missing values with median imputation...")
    imputer = SimpleImputer(strategy='median')
    X_imputed = imputer.fit_transform(X)
    X = pd.DataFrame(X_imputed, columns=X.columns)
    
    missing_before = df[X.columns].isnull().sum().sum()
    print(f"   Missing values before: {missing_before}")
    print(f"   Missing values after: {X.isnull().sum().sum()}")
    
    # Remove rows with extreme values or NaNs in target
    print("\n4. Cleaning target variable...")
    y_before = len(y)
    y = y[~y.isnull()]
    X = X[y.index]
    print(f"   Rows before cleaning: {y_before}")
    print(f"   Rows after cleaning: {len(y)}")
    
    # Standardize features
    print("\n5. Standardizing features...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    X = pd.DataFrame(X_scaled, columns=X.columns)
    
    # Train-test split
    print("\n6. Splitting data into train/test sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"   Training set: {X_train.shape[0]:,} samples")
    print(f"   Test set: {X_test.shape[0]:,} samples")
    print(f"   Training target distribution:\n{y_train.value_counts()}")
    print(f"   Test target distribution:\n{y_test.value_counts()}")
    
    # Train LightGBM model with optimized parameters for large dataset
    print("\n7. Training LightGBM model (large dataset optimized)...")
    lgbm_model = lgb.LGBMClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=7,  # Reduced depth for large datasets
        num_leaves=31,  # Limited leaves to prevent overfitting
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbose=-1,
        class_weight='balanced',
        n_jobs=-1,  # Use all CPU cores
        min_child_samples=20  # Prevent overfitting on large data
    )
    
    lgbm_model.fit(X_train, y_train)
    print("   Model training completed")
    
    # Evaluate on test set
    print("\n8. Evaluating model on test set...")
    y_pred = lgbm_model.predict(X_test)
    y_pred_proba = lgbm_model.predict_proba(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    
    print(f"\n   Model Performance:")
    print(f"   Accuracy:  {accuracy:.4f}")
    print(f"   Precision: {precision:.4f}")
    print(f"   Recall:    {recall:.4f}")
    print(f"   F1 Score:  {f1:.4f}")
    print(f"\n   Confusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(f"   {cm}")
    print(f"\n   Classification Report:")
    print(classification_report(y_test, y_pred))
    
    # Feature importance
    print("\n9. Feature importance (top 15):")
    feature_importance = pd.DataFrame({
        'feature': X.columns,
        'importance': lgbm_model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    for idx, row in feature_importance.head(15).iterrows():
        print(f"   {idx+1}. {row['feature']}: {row['importance']:.4f}")
    
    # Save model and preprocessing objects
    print("\n10. Saving model and preprocessing objects...")
    model_path = MODEL_DIR / "lightgbm_model.pkl"
    scaler_path = MODEL_DIR / "scaler.pkl"
    imputer_path = MODEL_DIR / "imputer.pkl"
    feature_names_path = MODEL_DIR / "feature_names.pkl"
    metrics_path = MODEL_DIR / "model_metrics.pkl"
    
    joblib.dump(lgbm_model, model_path, compress=3)
    joblib.dump(scaler, scaler_path, compress=3)
    joblib.dump(imputer, imputer_path, compress=3)
    joblib.dump(X.columns.tolist(), feature_names_path, compress=3)
    
    # Save metrics for reference
    metrics = {
        'accuracy': float(accuracy),
        'precision': float(precision),
        'recall': float(recall),
        'f1': float(f1),
        'feature_importance': feature_importance.to_dict('records')
    }
    joblib.dump(metrics, metrics_path, compress=3)
    
    print(f"   Model saved: {model_path}")
    print(f"   Scaler saved: {scaler_path}")
    print(f"   Imputer saved: {imputer_path}")
    print(f"   Feature names saved: {feature_names_path}")
    print(f"   Metrics saved: {metrics_path}")
    
    print("\n" + "=" * 70)
    print("TRAINING COMPLETED SUCCESSFULLY")
    print("=" * 70)
    
except FileNotFoundError:
    print("ERROR: Dataset.csv not found. Please ensure the file is in the current directory.")
    print("Place your Dataset.csv in the project root folder.")
except Exception as e:
    print(f"ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
