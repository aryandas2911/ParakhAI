# ParakhAI (Legal Metrology Compliance Engine)

> **SIH 2026 Hackathon Project | Problem Statement ID: 26034**
> **Organization:** Ministry of Consumer Affairs, Food & Public Distribution
> **Department:** Department of Consumer Affairs (DoCA)
> **Theme:** Agriculture, FoodTech & Rural Development

---

## Project Overview

**ParakhAI** is an AI-powered software system designed to automate the compliance verification of packaged commodities under the **Legal Metrology (Packaged Commodities) Rules, 2011**.

The system enables enforcement officials and inspectors to upload product packaging images, extract mandatory declarations using Computer Vision & OCR, validate declarations against structured rule engines, identify non-compliance/violations, store evidence, and generate comprehensive digital inspection reports.

---

## Project Structure

```
LM-CE (ParakhAI)/
├── backend/                    # FastAPI Python Backend
│   ├── app/
│   │   ├── api/                # REST API endpoints (health, auth, products, inspections)
│   │   ├── core/               # Config, Supabase client, JWT auth dependency
│   │   ├── models/             # Database models
│   │   ├── schemas/            # Pydantic validation schemas
│   │   ├── services/           # Business logic, OCR, Rule Engine
│   │   └── main.py             # FastAPI app entry point
│   ├── supabase/migrations/    # SQL schema migrations
│   ├── requirements.txt
│   └── .env                    # Environment variables (not committed)
└── frontend/                   # Next.js Frontend App
    ├── app/                    # App Router pages
    │   ├── auth/               # Login/signup
    │   ├── dashboard/          # Executive dashboard
    │   ├── inspections/        # Inspection CRUD + image upload + detail view
    │   ├── reports/            # Report generation & listing
    │   ├── settings/           # Rule engine config
    │   └── help/               # In-app documentation
    ├── components/layout/      # AppShell, Sidebar, Header
    ├── context/                # AuthContext (Supabase JWT)
    ├── lib/                    # API client, Supabase clients
    └── package.json
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Backend | Python 3.12+, FastAPI, Uvicorn |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Storage | Supabase Storage (inspection images) |
| Auth | Supabase Auth (JWT Bearer tokens) |
| Version Control | Git |

---

## Getting Started

### Prerequisites

- Node.js v18+
- Python 3.10+
- A [Supabase](https://supabase.com) project

### 1. Backend Setup

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

Create `backend/.env`:

```env
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

> The service role key bypasses RLS. Never expose it client-side.

Run the server:

```bash
uvicorn app.main:app --reload --port 8000
```

- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Run the dev server:

```bash
npm run dev
```

- App: `http://localhost:3000`

### 3. Database Setup

Apply the SQL migrations from `backend/supabase/migrations/` to your Supabase SQL Editor:

1. `001_initial_schema.sql` - Tables, indexes, triggers, RLS policies
2. `002_profiles_rls_policies.sql` - Profile-level RLS policies

The `inspection-images` storage bucket is auto-created on first API call.

---

## API Endpoints

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server status |
| GET | `/health/db` | Database connectivity |
| GET | `/health/schema` | Schema validation |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/me` | Current authenticated user |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get current user profile |
| PATCH | `/api/profile` | Update profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products` | Create a product |
| GET | `/api/products` | List all products |
| GET | `/api/products/{id}` | Get product by ID |
| PATCH | `/api/products/{id}` | Update product |

### Inspections
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/inspections` | Create inspection (requires product_id) |
| GET | `/api/inspections` | List user's inspections |
| GET | `/api/inspections/{id}` | Get inspection detail |
| POST | `/api/inspections/{id}/images` | Upload image (multipart/form-data) |
| GET | `/api/inspections/{id}/images` | List images (returns signed URLs) |
| DELETE | `/api/inspections/{id}/images/{image_id}` | Delete image (Storage + DB) |

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (linked to Supabase Auth) |
| `products` | Product catalog |
| `inspections` | Inspection records (links product + inspector) |
| `inspection_images` | Uploaded images (stores signed URLs) |
| `declarations` | Extracted label declarations |
| `violations` | Detected compliance violations |
| `evidence` | Evidence linking violations to images |
| `reports` | Generated compliance reports |
| `compliance_rules` | Configurable rule engine definitions |

All tables have RLS enabled. Ownership is enforced at the API level via JWT Bearer tokens.

---

## Key Features

- **Authentication**: Supabase Auth with JWT Bearer tokens, role-based profiles
- **Product Management**: CRUD for product catalog
- **Inspection Workflow**: Create inspection -> Upload images -> View detail
- **Image Upload**: JPEG/PNG only, 10MB limit, signed URLs with 10-year expiry
- **Image Navigation**: Prev/next arrows in evidence frame, thumbnail strip in modal
- **Ownership Enforcement**: Users can only access/modify their own inspections and images
- **Signed URLs**: Images stored in Supabase Storage, accessed via long-lived signed URLs

---

## Roadmap

- [x] App Shell, Layout, and Page Router
- [x] Authentication (Supabase Auth)
- [x] Product Management
- [x] Inspection CRUD with image upload
- [x] Signed URL generation for image access
- [x] Ownership-based access control
- [ ] OCR pipeline integration (PaddleOCR / Tesseract)
- [ ] Legal Metrology rule engine
- [ ] Compliance report PDF generation
- [ ] Role-based access control (RBAC) enforcement

---

## License

Developed for **Smart India Hackathon (SIH) 2026** under the **Department of Consumer Affairs (DoCA)** problem statement.
