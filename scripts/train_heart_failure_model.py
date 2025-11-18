"""
Train LightGBM model on heart failure clinical records dataset.
This script handles the UCI Heart Failure Clinical Records dataset.
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
print("TRAINING LIGHTGBM MODEL ON HEART FAILURE DATASET")
print("=" * 70)

try:
    # Load dataset
    print("\n1. Loading heart failure dataset...")
    df = pd.read_csv("Dataset.csv")
    print(f"   Dataset shape: {df.shape}")
    print(f"   Columns: {df.columns.tolist()}")
    
    # Identify target variable
    target_col = None
    if 'DEATH_EVENT' in df.columns:
        target_col = 'DEATH_EVENT'
    elif 'death_event' in df.columns:
        target_col = 'death_event'
    else:
        print("   WARNING: Could not find target column (DEATH_EVENT)")
        print(f"   Available columns: {df.columns.tolist()}")
        target_col = df.columns[-1]
    
    print(f"   Target column: {target_col}")
    
    # Prepare features and target
    X = df.drop(columns=[target_col], errors='ignore')
    y = df[target_col]
    
    print(f"\n2. Feature analysis...")
    print(f"   Features shape: {X.shape}")
    print(f"   Feature columns: {X.columns.tolist()}")
    print(f"   Target distribution:\n{y.value_counts()}")
    print(f"   Class ratio: {y.value_counts(normalize=True)}")
    
    # Handle missing values
    print("\n3. Handling missing values...")
    imputer = SimpleImputer(strategy='median')
    X_imputed = imputer.fit_transform(X)
    X = pd.DataFrame(X_imputed, columns=X.columns)
    print(f"   Missing values: {X.isnull().sum().sum()}")
    
    # Remove rows with missing target
    print("\n4. Cleaning target variable...")
    y_before = len(y)
    y = y[~y.isnull()]
    X = X[y.index]
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
    
    # Train LightGBM model
    print("\n7. Training LightGBM model...")
    lgbm_model = lgb.LGBMClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=7,
        num_leaves=31,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbose=-1,
        class_weight='balanced',
        n_jobs=-1,
        min_child_samples=10,
        is_unbalance=True,
        scale_pos_weight=10
    )
    
    lgbm_model.fit(X_train, y_train)
    print("   Model training completed")
    
    # Evaluate with optimized threshold
    print("\n8. Evaluating model...")
    y_pred_proba = lgbm_model.predict_proba(X_test)
    
    threshold = 0.3
    y_pred = (y_pred_proba[:, 1] >= threshold).astype(int)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    
    print(f"   Accuracy:  {accuracy:.4f}")
    print(f"   Precision: {precision:.4f}")
    print(f"   Recall:    {recall:.4f}")
    print(f"   F1 Score:  {f1:.4f}")
    print(f"\n   Confusion Matrix:\n{confusion_matrix(y_test, y_pred)}")
    
    # Feature importance
    print("\n9. Feature importance (top 10):")
    feature_importance = pd.DataFrame({
        'feature': X.columns,
        'importance': lgbm_model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    for idx, row in feature_importance.head(10).iterrows():
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
    
except Exception as e:
    print(f"ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
