import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib
import os

# Create output directory
os.makedirs("backend/models", exist_ok=True)

print("Loading SEPSIS dataset...")
df = pd.read_csv("Dataset.csv")

# Drop unnecessary columns
df = df.drop(columns=['Unnamed: 0', 'Patient_ID', 'Hour'], errors='ignore')

# Define features and target
target = 'SepsisLabel'
X = df.drop(columns=[target, 'ICULOS'], errors='ignore')
y = df[target].astype(int)

print(f"Dataset shape: {X.shape}")
print(f"Features: {X.columns.tolist()}")

# Handle missing values with median imputation
imputer = SimpleImputer(strategy='median')
X_imputed = imputer.fit_transform(X)

# Standardize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_imputed)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

print("Training LightGBM model...")
# Train LightGBM with optimized parameters for imbalanced data
lgbm_model = lgb.LGBMClassifier(
    n_estimators=200,
    learning_rate=0.05,
    max_depth=7,
    num_leaves=31,
    subsample=0.8,
    colsample_bytree=0.8,
    is_unbalance=True,
    scale_pos_weight=10,
    random_state=42,
    verbose=-1
)
lgbm_model.fit(X_train, y_train)

# Evaluate model
y_pred = lgbm_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, zero_division=0)
recall = recall_score(y_test, y_pred, zero_division=0)
f1 = f1_score(y_test, y_pred, zero_division=0)

print(f"\nModel Performance:")
print(f"Accuracy: {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall: {recall:.4f}")
print(f"F1 Score: {f1:.4f}")

# Save model and preprocessing objects
model_path = "backend/models/sepsis_lgbm_model.pkl"
imputer_path = "backend/models/imputer.pkl"
scaler_path = "backend/models/scaler.pkl"

joblib.dump(lgbm_model, model_path)
joblib.dump(imputer, imputer_path)
joblib.dump(scaler, scaler_path)

print(f"\nModel saved to {model_path}")
print(f"Imputer saved to {imputer_path}")
print(f"Scaler saved to {scaler_path}")
