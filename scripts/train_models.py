"""
Script to train and save mock ML models for sepsis detection.
This creates the .pkl files needed by the Flask backend.
"""

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
from pathlib import Path

# Create models directory
MODEL_DIR = Path(__file__).parent.parent / "backend" / "models"
MODEL_DIR.mkdir(exist_ok=True)

# Generate synthetic training data
np.random.seed(42)
n_samples = 500

# Features: temperature, heart_rate, systolic_bp, diastolic_bp, respiratory_rate, wbc_count
X = np.random.randn(n_samples, 6)
X[:, 0] = np.random.uniform(35, 40, n_samples)  # temperature
X[:, 1] = np.random.uniform(60, 120, n_samples)  # heart_rate
X[:, 2] = np.random.uniform(90, 160, n_samples)  # systolic_bp
X[:, 3] = np.random.uniform(50, 100, n_samples)  # diastolic_bp
X[:, 4] = np.random.uniform(12, 30, n_samples)  # respiratory_rate
X[:, 5] = np.random.uniform(3, 15, n_samples)  # wbc_count

# Generate labels based on simple rules (for demonstration)
y = np.zeros(n_samples)
for i in range(n_samples):
    sepsis_score = 0
    if X[i, 0] > 38.5:  # high temperature
        sepsis_score += 1
    if X[i, 1] > 100:  # high heart rate
        sepsis_score += 1
    if X[i, 4] > 20:  # high respiratory rate
        sepsis_score += 1
    if X[i, 5] > 11:  # high WBC count
        sepsis_score += 1
    y[i] = 1 if sepsis_score >= 2 else 0

# Add some noise
noise_indices = np.random.choice(n_samples, size=int(0.1 * n_samples), replace=False)
y[noise_indices] = 1 - y[noise_indices]

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train Logistic Regression
print("Training Logistic Regression...")
lr_model = LogisticRegression(random_state=42, max_iter=1000)
lr_model.fit(X_train, y_train)
lr_pred = lr_model.predict(X_test)
print(f"  Accuracy: {accuracy_score(y_test, lr_pred):.2f}")
print(f"  Precision: {precision_score(y_test, lr_pred):.2f}")
print(f"  Recall: {recall_score(y_test, lr_pred):.2f}")
print(f"  F1-Score: {f1_score(y_test, lr_pred):.2f}")
joblib.dump(lr_model, MODEL_DIR / "logistic_regression.pkl")

# Train Decision Tree
print("\nTraining Decision Tree...")
dt_model = DecisionTreeClassifier(random_state=42, max_depth=10)
dt_model.fit(X_train, y_train)
dt_pred = dt_model.predict(X_test)
print(f"  Accuracy: {accuracy_score(y_test, dt_pred):.2f}")
print(f"  Precision: {precision_score(y_test, dt_pred):.2f}")
print(f"  Recall: {recall_score(y_test, dt_pred):.2f}")
print(f"  F1-Score: {f1_score(y_test, dt_pred):.2f}")
joblib.dump(dt_model, MODEL_DIR / "decision_tree.pkl")

# Train Random Forest
print("\nTraining Random Forest...")
rf_model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=15)
rf_model.fit(X_train, y_train)
rf_pred = rf_model.predict(X_test)
print(f"  Accuracy: {accuracy_score(y_test, rf_pred):.2f}")
print(f"  Precision: {precision_score(y_test, rf_pred):.2f}")
print(f"  Recall: {recall_score(y_test, rf_pred):.2f}")
print(f"  F1-Score: {f1_score(y_test, rf_pred):.2f}")
joblib.dump(rf_model, MODEL_DIR / "random_forest.pkl")

print(f"\nModels saved to {MODEL_DIR}")
