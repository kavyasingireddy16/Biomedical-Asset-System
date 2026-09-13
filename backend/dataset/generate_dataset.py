import random
import pandas as pd

asset_types = [
    "Ventilator",
    "ECG Machine",
    "MRI Scanner",
    "CT Scanner",
    "Infusion Pump",
    "Defibrillator",
    "Ultrasound Machine",
    "Patient Monitor"
]

manufacturers = [
    "Philips",
    "GE Healthcare",
    "Siemens",
    "Drager",
    "Mindray"
]

departments = [
    "ICU",
    "Emergency",
    "Cardiology",
    "Radiology",
    "Operation Theatre"
]

statuses = [
    "Working",
    "Under Maintenance",
    "Out of Service"
]

data = []

for i in range(1, 1001):

    asset_age = random.randint(1, 10)

    usage_hours = random.randint(500, 25000)

    maintenance_count = random.randint(1, 15)

    maintenance_cost = random.randint(500, 15000)

    breakdown_count = random.randint(0, 10)

    last_service_days = random.randint(1, 365)

    warranty = random.choice(["Yes", "No"])

    status = random.choice(statuses)

    failure = 0

    if (
        asset_age > 6
        or maintenance_cost > 8000
        or breakdown_count > 4
        or status == "Out of Service"
    ):
        failure = 1

    data.append([
        i,
        random.choice(asset_types),
        random.choice(manufacturers),
        random.choice(departments),
        asset_age,
        usage_hours,
        maintenance_count,
        maintenance_cost,
        breakdown_count,
        last_service_days,
        status,
        warranty,
        failure
    ])

columns = [
    "asset_id",
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
    "warranty",
    "failure"
]

df = pd.DataFrame(data, columns=columns)

df.to_csv("dataset/asset_dataset.csv", index=False)

print("Dataset generated successfully!")

print(df.head())