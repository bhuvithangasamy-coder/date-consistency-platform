"""
MIMIC-IV Schema & Rule Engine Default Configuration
Maps actual clinical fields from the MIMIC-IV dataset.
"""

MIMIC_TABLES_SCHEMA = {
    "patients": {
        "primary_key": "subject_id",
        "date_columns": ["dod"],
        "columns": ["subject_id", "gender", "anchor_age", "anchor_year", "anchor_year_group", "dod"]
    },
    "admissions": {
        "primary_key": "hadm_id",
        "foreign_keys": {"subject_id": "patients.subject_id"},
        "date_columns": ["admittime", "dischtime", "deathtime"],
        "columns": [
            "subject_id", "hadm_id", "admittime", "dischtime", "deathtime",
            "admission_type", "admission_location", "discharge_location",
            "insurance", "language", "marital_status", "race"
        ]
    },
    "transfers": {
        "primary_key": "transfer_id",
        "foreign_keys": {"subject_id": "patients.subject_id", "hadm_id": "admissions.hadm_id"},
        "date_columns": ["intime", "outtime"],
        "columns": ["subject_id", "hadm_id", "transfer_id", "eventtype", "careunit", "intime", "outtime"]
    },
    "labevents": {
        "primary_key": "labevent_id",
        "foreign_keys": {"subject_id": "patients.subject_id", "hadm_id": "admissions.hadm_id"},
        "date_columns": ["charttime", "storetime"],
        "columns": ["labevent_id", "subject_id", "hadm_id", "specimen_id", "itemid", "charttime", "storetime", "value", "valuenum", "valueuom", "flag"]
    },
    "prescriptions": {
        "primary_key": "pharmacy_id",
        "foreign_keys": {"subject_id": "patients.subject_id", "hadm_id": "admissions.hadm_id"},
        "date_columns": ["starttime", "stoptime"],
        "columns": ["subject_id", "hadm_id", "pharmacy_id", "starttime", "stoptime", "drug_type", "drug", "dose_val_rx", "dose_unit_rx", "route"]
    },
    "icustays": {
        "primary_key": "stay_id",
        "foreign_keys": {"subject_id": "patients.subject_id", "hadm_id": "admissions.hadm_id"},
        "date_columns": ["intime", "outtime"],
        "columns": ["subject_id", "hadm_id", "stay_id", "first_careunit", "last_careunit", "intime", "outtime", "los"]
    },
    "chartevents": {
        "primary_key": None,
        "foreign_keys": {"subject_id": "patients.subject_id", "hadm_id": "admissions.hadm_id", "stay_id": "icustays.stay_id"},
        "date_columns": ["charttime", "storetime"],
        "columns": ["subject_id", "hadm_id", "stay_id", "charttime", "storetime", "itemid", "valuenum", "valueuom"]
    }
}

DEFAULT_EVENT_MAPPINGS = [
    {"entity_id": "subject_id", "event_name": "Hospital Admission", "table_name": "admissions", "timestamp_column": "admittime", "sequence_order": 1, "is_active": True},
    {"entity_id": "subject_id", "event_name": "Ward Transfer / Intake", "table_name": "transfers", "timestamp_column": "intime", "sequence_order": 2, "is_active": True},
    {"entity_id": "subject_id", "event_name": "ICU Stay Admission", "table_name": "icustays", "timestamp_column": "intime", "sequence_order": 3, "is_active": True},
    {"entity_id": "subject_id", "event_name": "Clinical Chart Measurement", "table_name": "chartevents", "timestamp_column": "charttime", "sequence_order": 4, "is_active": True},
    {"entity_id": "subject_id", "event_name": "Lab Specimen Drawn", "table_name": "labevents", "timestamp_column": "charttime", "sequence_order": 5, "is_active": True},
    {"entity_id": "subject_id", "event_name": "Medication Start", "table_name": "prescriptions", "timestamp_column": "starttime", "sequence_order": 6, "is_active": True},
    {"entity_id": "subject_id", "event_name": "Medication End", "table_name": "prescriptions", "timestamp_column": "stoptime", "sequence_order": 7, "is_active": True},
    {"entity_id": "subject_id", "event_name": "Hospital Discharge", "table_name": "admissions", "timestamp_column": "dischtime", "sequence_order": 8, "is_active": True},
]

DEFAULT_RULES = [
    {
        "rule_code": "RULE-001",
        "name": "Admission before Discharge",
        "description": "Hospital admission timestamp (admittime) must occur on or before discharge timestamp (dischtime).",
        "source_table": "admissions",
        "left_field": "admittime",
        "operator": "<=",
        "right_field": "dischtime",
        "severity": "Critical",
        "status": "Active",
        "version": "v1.0"
    },
    {
        "rule_code": "RULE-002",
        "name": "Transfer In before Transfer Out",
        "description": "Ward transfer intake timestamp (intime) must occur on or before outtime.",
        "source_table": "transfers",
        "left_field": "intime",
        "operator": "<=",
        "right_field": "outtime",
        "severity": "High",
        "status": "Active",
        "version": "v1.0"
    },
    {
        "rule_code": "RULE-003",
        "name": "Required Admission Timestamp Non-Null",
        "description": "Admittime must not be null or missing for any inpatient record.",
        "source_table": "admissions",
        "left_field": "admittime",
        "operator": "IS_NOT_NULL",
        "right_field": None,
        "severity": "High",
        "status": "Active",
        "version": "v1.0"
    },
    {
        "rule_code": "RULE-004",
        "name": "No Future Timestamps",
        "description": "Clinical timestamps must not occur in the future relative to execution reference date.",
        "source_table": "admissions",
        "left_field": "dischtime",
        "operator": "NOT_FUTURE",
        "right_field": None,
        "severity": "Critical",
        "status": "Active",
        "version": "v1.0"
    },
    {
        "rule_code": "RULE-005",
        "name": "Prescription Non-Negative Duration",
        "description": "Prescription starttime must be on or before stoptime.",
        "source_table": "prescriptions",
        "left_field": "starttime",
        "operator": "<=",
        "right_field": "stoptime",
        "severity": "Medium",
        "status": "Active",
        "version": "v1.0"
    },
    {
        "rule_code": "RULE-006",
        "name": "Lab Charttime before Lab Storetime",
        "description": "Lab specimen charttime must occur on or before storetime result entry.",
        "source_table": "labevents",
        "left_field": "charttime",
        "operator": "<=",
        "right_field": "storetime",
        "severity": "Low",
        "status": "Active",
        "version": "v1.0"
    },
    {
        "rule_code": "RULE-007",
        "name": "Valid Date Format ISO Standard",
        "description": "Timestamps must conform to valid parseable ISO date format (YYYY-MM-DD HH:MM:SS).",
        "source_table": "patients",
        "left_field": "dod",
        "operator": "VALID_FORMAT",
        "right_field": None,
        "severity": "Medium",
        "status": "Active",
        "version": "v1.0"
    }
]
