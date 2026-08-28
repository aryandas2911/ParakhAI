# ParakhAI (Legal Metrology Compliance Engine)

> **SIH 2026 Hackathon Project | Problem Statement ID: 26034**  
> **Organization:** Ministry of Consumer Affairs, Food & Public Distribution  
> **Department:** Department of Consumer Affairs (DoCA)  
> **Theme:** Agriculture, FoodTech & Rural Development  

---

## 📌 Project Overview

**ParakhAI** is an AI-powered software system designed to automate the compliance verification of packaged commodities under the **Legal Metrology (Packaged Commodities) Rules, 2011**. 

The system enables enforcement officials and inspectors to upload product packaging images, extract mandatory declarations using Computer Vision & OCR, validate declarations against structured rule engines, identify non-compliance/violations, store evidence, and generate comprehensive digital inspection reports.

---

## ✨ Key Features Implemented So Far

### 🎨 Frontend (Next.js 15 App Router + Tailwind CSS)
- **App Shell & Layout**: Responsive layout with collapsible sidebar, top navigation bar, quick actions, breadcrumb navigation, and dark/light theme switcher.
- **Authentication Portal (`/auth`)**: Role-based login interface for enforcement officials and administrators.
- **Executive Dashboard (`/dashboard`)**: Compliance metrics, active violations breakdown, recent inspection history, and system health status.
- **Inspections Management (`/inspections`)**: New inspection upload workflow, image dropzone, inspection list view with status tags, and detail view modal.
- **Reports Module (`/reports`)**: Filterable inspection report list with PDF/Editable document export options.
- **Settings & Rule Engine Config (`/settings`)**: Rule parameter adjustments, threshold settings, and user permission configurations.
- **Help & Rules Reference (`/help`)**: In-app documentation on Legal Metrology guidelines and user manual.
- **Backend API Integration**: Integrated API client (`lib/api.ts`) for health check and backend communication.

### ⚙️ Backend (FastAPI + Python)
- **FastAPI Core Setup**: Structured app directory (`app/api`, `app/core`, `app/models`, `app/schemas`, `app/services`).
- **Configuration & Environment**: Modular configuration using `pydantic-settings` supporting local `.env` setup.
- **CORS Handling**: Configured middleware allowing cross-origin requests from the Next.js frontend.
- **Health Check Endpoint**: `/health` API returning server operational status, service metadata, and version.

---

## 🏗️ Project Architecture & Tech Stack

```text
LM-CE (ParakhAI)/
├── backend/            # FastAPI Python Backend
│   ├── app/
│   │   ├── api/        # REST API endpoints & routes
│   │   ├── core/       # App configuration & environment settings
│   │   ├── models/     # Database models (SQLAlchemy / ORM)
│   │   ├── schemas/    # Pydantic validation schemas
│   │   ├── services/   # Business logic, OCR, & Rule Engine core
│   │   └── main.py     # FastAPI application entry point
│   ├── .env.example    # Backend environment template
│   └── requirements.txt
└── frontend/           # Next.js Frontend App
    ├── app/            # App Router pages (auth, dashboard, inspections, etc.)
    ├── components/     # AppShell, Sidebar, Header, UI components
    ├── lib/            # Utility functions & API integration
    ├── PRD.md          # Detailed Product Requirements Document
    ├── .env.example    # Frontend environment template
    └── package.json
```

### Stack Summary
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic v2
- **Version Control**: Git (`https://github.com/aryandas2911/ParakhAI.git`)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **Python**: v3.10 or higher
- **npm** / **yarn** / **pnpm**

---

### 1. Setting Up the Backend (FastAPI)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # On Windows
   python -m venv venv
   .\venv\Scripts\activate

   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create and configure environment file:
   ```bash
   cp .env.example .env
   ```
   Open `backend/.env` and update the Supabase environment variables with your project credentials:
   ```env
   SUPABASE_URL=https://<your-project-id>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
   ```
   > ⚠️ **Security Note:** Keep `SUPABASE_SERVICE_ROLE_KEY` strictly inside the backend `.env` file and never commit it to source control.

5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend API will be running at `http://localhost:8000`.  
   Interactive API documentation (Swagger UI) is available at `http://localhost:8000/docs`.  
   Check database connectivity at `http://localhost:8000/health/db`.

---

### 2. Setting Up the Frontend (Next.js)

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install Node modules:
   ```bash
   npm install
   ```

3. Create and configure environment file:
   ```bash
   cp .env.example .env.local
   ```
   Open `frontend/.env.local` and set your public Supabase project credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.


---

## 📋 Roadmap & Next Steps

- [x] Initial UI App Shell and Page Router structure
- [x] Base FastAPI project structure and health monitoring
- [ ] Image preprocessing & OCR pipeline integration (PaddleOCR / Tesseract / OpenCV)
- [ ] Legal Metrology rule engine parser implementation
- [ ] Database schema setup (PostgreSQL / SQLite) for inspection persistence
- [ ] PDF compliance report generator
- [ ] Role-based access control (RBAC) authentication

---

## 📄 License & Attribution

Developed for **Smart India Hackathon (SIH) 2026** under the **Department of Consumer Affairs (DoCA)** problem statement.
