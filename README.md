# AI-Powered Predictive Biomedical Asset Management and Equipment Lifecycle System

## 📌 Project Overview

The **AI-Powered Predictive Biomedical Asset Management and Equipment Lifecycle System** is a web-based system designed to help healthcare organizations manage biomedical equipment, monitor equipment health, track maintenance activities, and predict potential equipment failure.

The system combines **biomedical asset management, machine learning-based failure prediction, maintenance tracking, QR code identification, analytics, and AI-assisted engineering analysis** into a single platform.

---

## 🎯 Objectives

- Maintain a centralized record of biomedical equipment.
- Track equipment status, usage, age, maintenance, and breakdown information.
- Monitor equipment health and failure risk.
- Predict potential equipment failure using machine learning.
- Provide maintenance recommendations based on equipment condition.
- Maintain maintenance history and maintenance costs.
- Generate QR codes for biomedical assets.
- Provide dashboards and analytics for equipment monitoring.
- Generate AI-assisted engineering analysis for equipment condition.

---

## 🚀 Key Features

### 1. Biomedical Asset Management

The system supports complete asset management:

- Add biomedical assets
- View asset details
- Edit asset information
- Delete assets
- Search assets
- Filter by department
- Filter by status
- Filter by AI risk level

### 2. Equipment Health Monitoring

The system evaluates equipment condition using information such as:

- Asset age
- Usage hours
- Maintenance count
- Maintenance cost
- Breakdown count
- Days since last service
- Warranty status
- Equipment status

### 3. AI Failure Prediction

The system uses a trained machine learning model to estimate equipment failure probability.

The prediction provides:

- Failure probability
- Failure risk
- Equipment health score
- Maintenance priority
- Estimated remaining life
- Recommended action

The prediction system also incorporates maintenance-condition risk indicators such as previous breakdowns, overdue servicing, equipment age, and maintenance frequency.

### 4. AI Engineering Analysis

The system can generate an AI-assisted engineering assessment based on the equipment information and predictive results.

The analysis can provide information related to:

- Equipment health
- Possible failure reasons
- Maintenance recommendations
- Safety risk
- Estimated urgency

### 5. Maintenance Management

The system maintains maintenance records for biomedical equipment.

Maintenance information includes:

- Maintenance date
- Maintenance type
- Engineer
- Maintenance cost
- Maintenance status
- Remarks

### 6. QR Code Identification

Each biomedical asset can have a QR code associated with its asset ID.

QR codes can be used to quickly identify and access equipment information.

### 7. Dashboard and Analytics

The dashboard provides an overview of the biomedical equipment inventory, including:

- Total assets
- Working assets
- Assets under maintenance
- Out-of-service assets
- Average health score
- Failure probability
- AI risk distribution
- Assets by department
- Maintenance cost

---

## 🧠 Machine Learning

The predictive component uses a trained neural-network model for binary equipment failure prediction.

### Input Features

The model uses:

- Asset type
- Manufacturer
- Department
- Asset age
- Usage hours
- Maintenance count
- Maintenance cost
- Breakdown count
- Last service days
- Equipment status
- Warranty

Categorical features are encoded and numerical inputs are scaled before being passed to the model.

### Prediction Output

The prediction system produces:

```text
Failure Probability
Health Score
Failure Risk
Priority
Estimated Remaining Life
Recommended Action