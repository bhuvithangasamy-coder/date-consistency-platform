# Date Consistency Validation Platform

An enterprise-grade, full-stack data engineering and clinical data quality validation platform built for detecting chronological inconsistencies, invalid dates, future timestamps, negative durations, missing timestamps, and event sequence violations across 1,000,000+ real-world clinical records from the Kaggle MIMIC-IV Clinical Database (`bbansal09/final-dataset-mimic-iv`).

---

## 🏗 Architecture & Stack Overview

* **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+), Chart.js, Lucide SVGs (Zero React/Vite runtime dependencies).
* **Backend**: Python 3.12, FastAPI, REST APIs, JWT Bearer Token Authentication, Passlib (`pbkdf2_sha256`).
* **Database**: MySQL 8.0 (`date_validation_db`) with SQLAlchemy ORM and PyMySQL driver.
* **Data Engineering**: Apache Spark 4.2 / PySpark with OpenJDK 17 for distributed timestamp standardization, ISO 8601 parsing, chronology rules, and anomaly extraction.
* **Storage / Datasets**: Real-world Kaggle MIMIC-IV clinical dataset (`patients`, `admissions`, `transfers`, `labevents`, `prescriptions`, `icustays`, `chartevents`).

```
HTML5 / CSS / Vanilla JS Frontend
       │
       ▼
FastAPI REST API Service
       │
       ▼
MySQL 8.0 Database Engine (date_validation_db)
       │
       ▼
Apache Spark / PySpark 4.2 Distributed Engine (1.1M+ Records)
```

---

## 🌐 Active Local URLs

* **Frontend Web Dashboard**: [http://127.0.0.1:8000/dashboard.html](http://127.0.0.1:8000/dashboard.html)
* **Backend REST API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **API Summary Endpoint**: [http://127.0.0.1:8000/api/dashboard/summary](http://127.0.0.1:8000/api/dashboard/summary)

---

## 📁 Repository Structure

```
date-consistency-platform/
│
├── frontend/                     # Modular Vanilla HTML + CSS + JS Frontend
│   ├── index.html                # Entry point redirecting to dashboard.html
│   ├── login.html                # Authentication view
│   ├── dashboard.html            # Main Enterprise Quality Dashboard
│   ├── datasets.html             # Kaggle Dataset Management
│   ├── preview.html              # Data Preview & Schema Inspector
│   ├── monitor.html              # PySpark Processing Monitor
│   ├── validation.html           # Date Validation Engine Runner
│   ├── anomalies.html            # Server-Side Paginated Anomaly Report
│   ├── timeline.html             # Patient Event Chronology Inspector
│   ├── rules.html                # Rule Management & Status Configurator
│   ├── onboarding.html           # Zero-Code Dataset Onboarding
│   ├── audit-logs.html           # System Audit Logs
│   ├── settings.html             # MySQL & PySpark Settings
│   ├── css/
│   │   └── style.css             # Enterprise Styling & Dark Theme
│   └── js/
│       ├── api.js                # Centralized Fetch API Layer
│       ├── auth.js               # JWT Auth & Token Management
│       ├── common.js             # Shared Layout, Navbar, Sidebar & Gauge Renderers
│       ├── dashboard.js          # Dashboard Metrics & Chart.js Visualizations
│       ├── datasets.js           # Dataset Management Logic
│       ├── anomalies.js          # Paginated Anomaly Filtering & Export
│       ├── timeline.js           # Patient Event Sequence Tree Generator
│       └── rules.js              # Rule Configurator
│
├── backend/
│   └── app/
│       ├── main.py               # FastAPI App Entry & Static Mount
│       ├── config.py             # System & MySQL Configuration Settings
│       ├── database.py           # SQLAlchemy MySQL Connection & Pooling
│       ├── models.py             # MySQL Database Table Schemas
│       ├── auth.py               # Authentication & Role Checker
│       ├── mimic_schema.py       # MIMIC-IV Rules & Schemas
│       ├── spark_engine.py       # Distributed PySpark Validation Pipeline
│       └── routers/              # 10 Dedicated REST API Routers
│
├── requirements.txt              # Python Dependencies
├── verify_mysql_system.py        # Automated System Verification Script
└── README.md                     # Platform Documentation
```

---

## 🔑 Login Credentials

| Role | Username | Password |
|---|---|---|
| **Analyst** | `analyst` | `analyst123` |
| **Admin** | `admin` | `admin123` |
| **Viewer** | `viewer` | `viewer123` |

---

## ⚡ How to Run Locally

### 1. Start MySQL Server
Ensure MySQL 8.0 server is running on `localhost` (port 3307 or 3306) with database `date_validation_db`.

### 2. Start FastAPI Backend & Static Server
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

### 3. Open Application
Navigate to **[http://127.0.0.1:8000/dashboard.html](http://127.0.0.1:8000/dashboard.html)** in your web browser.
