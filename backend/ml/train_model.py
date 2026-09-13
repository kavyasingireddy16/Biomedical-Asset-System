import pandas as pd
import joblib
import tensorflow as tf
import matplotlib.pyplot as plt

from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    confusion_matrix,
    classification_report,
    ConfusionMatrixDisplay
)

# ============================================================
# Load Dataset
# ============================================================

df = pd.read_csv("dataset/asset_dataset.csv")

# ============================================================
# Encode Categorical Features
# ============================================================

asset_encoder = LabelEncoder()
manufacturer_encoder = LabelEncoder()
department_encoder = LabelEncoder()
status_encoder = LabelEncoder()
warranty_encoder = LabelEncoder()

df["asset_type"] = asset_encoder.fit_transform(df["asset_type"])
df["manufacturer"] = manufacturer_encoder.fit_transform(df["manufacturer"])
df["department"] = department_encoder.fit_transform(df["department"])
df["status"] = status_encoder.fit_transform(df["status"])
df["warranty"] = warranty_encoder.fit_transform(df["warranty"])

# ============================================================
# Features and Target
# ============================================================

X = df[
    [
        "asset_type",
        "manufacturer",
        "department",
        "asset_age",
        "usage_hours",
        "maintenance_count",
        "maintenance_cost",
        "breakdown_count",
        "last_service_days",
        "status",
        "warranty"
    ]
]

y = df["failure"]

# ============================================================
# Feature Scaling
# ============================================================

scaler = StandardScaler()
X = scaler.fit_transform(X)

joblib.dump(scaler, "ml/scaler.pkl")

# ============================================================
# Train Test Split
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

# ============================================================
# Deep Learning Model
# ============================================================

model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(11,)),
    tf.keras.layers.Dense(128, activation="relu"),
    tf.keras.layers.Dropout(0.30),

    tf.keras.layers.Dense(64, activation="relu"),
    tf.keras.layers.Dropout(0.20),

    tf.keras.layers.Dense(32, activation="relu"),

    tf.keras.layers.Dense(1, activation="sigmoid")
])

# ============================================================
# Compile Model
# ============================================================

model.compile(
    optimizer="adam",
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

# ============================================================
# Callbacks
# ============================================================

early_stop = tf.keras.callbacks.EarlyStopping(
    monitor="val_loss",
    patience=5,
    restore_best_weights=True
)

checkpoint = tf.keras.callbacks.ModelCheckpoint(
    "ml/failure_model.keras",
    monitor="val_accuracy",
    save_best_only=True
)

# ============================================================
# Train Model
# ============================================================

history = model.fit(
    X_train,
    y_train,
    epochs=50,
    batch_size=32,
    validation_split=0.20,
    callbacks=[early_stop, checkpoint],
    verbose=1
)

# ============================================================
# Evaluate
# ============================================================

loss, accuracy = model.evaluate(
    X_test,
    y_test,
    verbose=0
)

print("\n======================================")
print(f"Test Accuracy : {accuracy:.4f}")
print("======================================")

# ============================================================
# Save Encoders
# ============================================================

joblib.dump(asset_encoder, "ml/asset_encoder.pkl")
joblib.dump(manufacturer_encoder, "ml/manufacturer_encoder.pkl")
joblib.dump(department_encoder, "ml/department_encoder.pkl")
joblib.dump(status_encoder, "ml/status_encoder.pkl")
joblib.dump(warranty_encoder, "ml/warranty_encoder.pkl")

print("\nDeep Learning Model Saved Successfully!")

# ============================================================
# Accuracy Graph
# ============================================================

plt.figure(figsize=(8,5))

plt.plot(history.history["accuracy"], label="Training Accuracy")
plt.plot(history.history["val_accuracy"], label="Validation Accuracy")

plt.title("Training vs Validation Accuracy")
plt.xlabel("Epoch")
plt.ylabel("Accuracy")
plt.legend()
plt.grid(True)

plt.savefig("ml/accuracy_graph.png")
plt.close()

# ============================================================
# Loss Graph
# ============================================================

plt.figure(figsize=(8,5))

plt.plot(history.history["loss"], label="Training Loss")
plt.plot(history.history["val_loss"], label="Validation Loss")

plt.title("Training vs Validation Loss")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.legend()
plt.grid(True)

plt.savefig("ml/loss_graph.png")
plt.close()

# ============================================================
# Confusion Matrix
# ============================================================

y_pred = (model.predict(X_test, verbose=0) > 0.5).astype(int)

cm = confusion_matrix(y_test, y_pred)

disp = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=["No Failure", "Failure"]
)

disp.plot()
plt.title("Confusion Matrix")

plt.savefig("ml/confusion_matrix.png")
plt.close()

# ============================================================
# Classification Report
# ============================================================

report = classification_report(
    y_test,
    y_pred,
    target_names=["No Failure", "Failure"]
)

print("\nClassification Report\n")
print(report)

with open("ml/classification_report.txt", "w") as file:
    file.write(report)

print("\nReports Generated Successfully!")