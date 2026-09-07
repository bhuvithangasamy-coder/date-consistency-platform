import os
import csv
import random
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "mimic_iv")
os.makedirs(DATA_DIR, exist_ok=True)

def generate_mimic_dataset():
    print("Generating 1,000,000+ MIMIC-IV clinical dataset records...")
    
    num_patients = 25000
    num_admissions = 40000
    num_transfers = 80000
    num_labevents = 500000
    num_prescriptions = 250000
    num_icustays = 40000
    num_chartevents = 200000

    base_time = datetime(2021, 1, 1, 8, 0, 0)

    # 1. Patients Table
    patients_file = os.path.join(DATA_DIR, "patients.csv")
    print(f"Writing {num_patients} patient records...")
    with open(patients_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["subject_id", "gender", "anchor_age", "anchor_year", "anchor_year_group", "dod"])
        for i in range(1, num_patients + 1):
            gender = "M" if i % 2 == 0 else "F"
            age = random.randint(18, 90)
            anchor_year = random.randint(2010, 2019)
            dod = ""
            if i % 20 == 0:
                dod_dt = base_time + timedelta(days=random.randint(100, 1000))
                if i % 100 == 0:
                    dod = dod_dt.strftime("%Y/%m/%d %H:%M")
                else:
                    dod = dod_dt.strftime("%Y-%m-%d %H:%M:%S")
            writer.writerow([10000000 + i, gender, age, anchor_year, "2017 - 2019", dod])

    # 2. Admissions Table
    admissions_file = os.path.join(DATA_DIR, "admissions.csv")
    print(f"Writing {num_admissions} admission records...")
    with open(admissions_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "subject_id", "hadm_id", "admittime", "dischtime", "deathtime", 
            "admission_type", "admission_location", "discharge_location", 
            "insurance", "language", "marital_status", "race"
        ])
        for i in range(1, num_admissions + 1):
            subject_id = 10000000 + random.randint(1, num_patients)
            hadm_id = 20000000 + i
            admittime_dt = base_time + timedelta(days=random.randint(0, 365), hours=random.randint(0, 23))
            
            if i % 33 == 0:
                dischtime_dt = admittime_dt - timedelta(hours=random.randint(2, 48))
            elif i % 50 == 0:
                dischtime_dt = datetime(2027, 5, 12, 10, 0, 0)
            else:
                dischtime_dt = admittime_dt + timedelta(days=random.randint(1, 14), hours=random.randint(1, 20))
            
            admittime_str = "" if i % 100 == 7 else admittime_dt.strftime("%Y-%m-%d %H:%M:%S")
            dischtime_str = dischtime_dt.strftime("%Y-%m-%d %H:%M:%S")
            deathtime_str = ""
            
            writer.writerow([
                subject_id, hadm_id, admittime_str, dischtime_str, deathtime_str,
                "EMERGENCY", "EMERGENCY ROOM", "HOME", "Other", "ENGLISH", "SINGLE", "WHITE"
            ])

    # 3. Transfers Table
    transfers_file = os.path.join(DATA_DIR, "transfers.csv")
    print(f"Writing {num_transfers} transfer records...")
    with open(transfers_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["subject_id", "hadm_id", "transfer_id", "eventtype", "careunit", "intime", "outtime"])
        for i in range(1, num_transfers + 1):
            subject_id = 10000000 + random.randint(1, num_patients)
            hadm_id = 20000000 + random.randint(1, num_admissions)
            transfer_id = 30000000 + i
            intime_dt = base_time + timedelta(days=random.randint(0, 365))
            if i % 50 == 3:
                outtime_dt = intime_dt - timedelta(hours=4)
            else:
                outtime_dt = intime_dt + timedelta(hours=random.randint(4, 72))
            
            writer.writerow([
                subject_id, hadm_id, transfer_id, "discharge", "Medical Intensive Care Unit (MICU)",
                intime_dt.strftime("%Y-%m-%d %H:%M:%S"), outtime_dt.strftime("%Y-%m-%d %H:%M:%S")
            ])

    # 4. Labevents Table
    labevents_file = os.path.join(DATA_DIR, "labevents.csv")
    print(f"Writing {num_labevents} labevent records...")
    with open(labevents_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["labevent_id", "subject_id", "hadm_id", "specimen_id", "itemid", "charttime", "storetime", "value", "valuenum", "valueuom", "flag"])
        for i in range(1, num_labevents + 1):
            subject_id = 10000000 + random.randint(1, num_patients)
            hadm_id = 20000000 + random.randint(1, num_admissions)
            charttime_dt = base_time + timedelta(days=random.randint(0, 365), hours=random.randint(0, 23))
            storetime_dt = charttime_dt + timedelta(minutes=random.randint(10, 120))
            if i % 100 == 15:
                storetime_dt = charttime_dt - timedelta(minutes=30)

            writer.writerow([
                i, subject_id, hadm_id, 5000000 + i, 50868,
                charttime_dt.strftime("%Y-%m-%d %H:%M:%S"),
                storetime_dt.strftime("%Y-%m-%d %H:%M:%S"),
                "13.5", 13.5, "mEq/L", "abnormal" if i % 5 == 0 else ""
            ])

    # 5. Prescriptions Table
    prescriptions_file = os.path.join(DATA_DIR, "prescriptions.csv")
    print(f"Writing {num_prescriptions} prescription records...")
    with open(prescriptions_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["subject_id", "hadm_id", "pharmacy_id", "starttime", "stoptime", "drug_type", "drug", "dose_val_rx", "dose_unit_rx", "route"])
        for i in range(1, num_prescriptions + 1):
            subject_id = 10000000 + random.randint(1, num_patients)
            hadm_id = 20000000 + random.randint(1, num_admissions)
            starttime_dt = base_time + timedelta(days=random.randint(0, 365))
            if i % 50 == 7:
                stoptime_dt = starttime_dt - timedelta(days=1)
            else:
                stoptime_dt = starttime_dt + timedelta(days=random.randint(1, 7))

            writer.writerow([
                subject_id, hadm_id, 7000000 + i,
                starttime_dt.strftime("%Y-%m-%d %H:%M:%S"),
                stoptime_dt.strftime("%Y-%m-%d %H:%M:%S"),
                "MAIN", "Acetaminophen", "500", "mg", "PO"
            ])

    # 6. ICU Stays Table
    icustays_file = os.path.join(DATA_DIR, "icustays.csv")
    print(f"Writing {num_icustays} ICU stay records...")
    with open(icustays_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["subject_id", "hadm_id", "stay_id", "first_careunit", "last_careunit", "intime", "outtime", "los"])
        for i in range(1, num_icustays + 1):
            subject_id = 10000000 + random.randint(1, num_patients)
            hadm_id = 20000000 + random.randint(1, num_admissions)
            intime_dt = base_time + timedelta(days=random.randint(0, 365))
            outtime_dt = intime_dt + timedelta(days=random.randint(1, 5))
            writer.writerow([
                subject_id, hadm_id, 30000000 + i,
                "MICU", "MICU",
                intime_dt.strftime("%Y-%m-%d %H:%M:%S"),
                outtime_dt.strftime("%Y-%m-%d %H:%M:%S"),
                2.5
            ])

    # 7. Chartevents Table
    chartevents_file = os.path.join(DATA_DIR, "chartevents.csv")
    print(f"Writing {num_chartevents} chartevent records...")
    with open(chartevents_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["subject_id", "hadm_id", "stay_id", "charttime", "storetime", "itemid", "valuenum", "valueuom"])
        for i in range(1, num_chartevents + 1):
            subject_id = 10000000 + random.randint(1, num_patients)
            hadm_id = 20000000 + random.randint(1, num_admissions)
            charttime_dt = base_time + timedelta(days=random.randint(0, 365), hours=random.randint(0, 23))
            storetime_dt = charttime_dt + timedelta(minutes=random.randint(5, 60))
            writer.writerow([
                subject_id, hadm_id, 30000000 + (i % num_icustays + 1),
                charttime_dt.strftime("%Y-%m-%d %H:%M:%S"),
                storetime_dt.strftime("%Y-%m-%d %H:%M:%S"),
                220045, 82.0, "bpm"
            ])

    total_rows = num_patients + num_admissions + num_transfers + num_labevents + num_prescriptions + num_icustays + num_chartevents
    print(f"Dataset generation complete! Total Records Processed across tables: {total_rows:,}")

if __name__ == "__main__":
    generate_mimic_dataset()
