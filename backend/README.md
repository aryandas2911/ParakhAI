# ParakhAI Backend

FastAPI backend for the Legal Metrology Compliance Engine.

## Tech Stack

- Python 3.12+
- FastAPI
- Uvicorn
- Supabase Python Client
- Pydantic v2 / pydantic-settings

## Getting Started

```bash
python -m venv venv
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

Create `.env`:

```env
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

Run the server:

```bash
uvicorn app.main:app --reload --port 8000
```

- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── health.py           # GET /health, /health/db, /health/schema
│   │   ├── auth.py             # GET /me (current user)
│   │   ├── profile.py          # GET/PATCH /api/profile
│   │   ├── products.py         # CRUD /api/products
│   │   └── inspections.py      # CRUD /api/inspections + image upload/delete
│   ├── core/
│   │   ├── config.py           # Settings (pydantic-settings, .env)
│   │   ├── supabase.py         # Supabase client (service role)
│   │   └── auth.py             # JWT Bearer dependency (get_current_user)
│   ├── models/                 # Database models
│   ├── schemas/                # Pydantic schemas
│   ├── services/               # Business logic
│   └── main.py                 # FastAPI app, CORS, router registration
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql       # Tables, indexes, triggers, RLS
│       └── 002_profiles_rls_policies.sql
├── requirements.txt
└── .env                        # Environment variables (not committed)
```

## API Endpoints

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Server status |
| GET | `/health/db` | No | Database connectivity |
| GET | `/health/schema` | No | Schema validation |

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/me` | Yes | Current authenticated user |

### Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/profile` | Yes | Get current user profile |
| PATCH | `/api/profile` | Yes | Update profile |

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/products` | Yes | Create a product |
| GET | `/api/products` | Yes | List all products |
| GET | `/api/products/{product_id}` | Yes | Get product by ID |
| PATCH | `/api/products/{product_id}` | Yes | Update product |

### Inspections

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/inspections` | Yes | Create inspection |
| GET | `/api/inspections` | Yes | List user's inspections |
| GET | `/api/inspections/{inspection_id}` | Yes | Get inspection detail |
| POST | `/api/inspections/{inspection_id}/images` | Yes | Upload image |
| GET | `/api/inspections/{inspection_id}/images` | Yes | List images |
| DELETE | `/api/inspections/{inspection_id}/images/{image_id}` | Yes | Delete image |

## Authentication

All authenticated endpoints use JWT Bearer tokens from Supabase Auth.

```python
from app.core.auth import get_current_user

@router.get("/protected")
async def protected_route(current_user = Depends(get_current_user)):
    user_id = current_user["user_id"]
    # ...
```

The `get_current_user` dependency:
1. Extracts the `Authorization: Bearer <token>` header
2. Validates the JWT via `client.auth.get_user(token)`
3. Returns the user dict with `user_id`, `email`, etc.
4. Raises 401 if invalid

## Image Upload Flow

1. Client sends `POST /api/inspections/{id}/images` with `multipart/form-data`
2. Backend validates: MIME type (JPEG/PNG only), file size (10MB max)
3. File uploaded to Supabase Storage at `inspections/{inspection_id}/{uuid}.{ext}`
4. Signed URL generated (10-year expiry)
5. Signed URL stored in `inspection_images.storage_path`
6. Signed URL returned in response

## Ownership Enforcement

Every inspection and image operation verifies the requesting user owns the resource:

```python
async def _verify_inspection_ownership(client, inspection_id, user_id):
    result = client.table("inspections").select("inspector_id") \
        .eq("inspection_id", inspection_id).single().execute()
    if result.data["inspector_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (linked to Supabase Auth) |
| `products` | Product catalog |
| `inspections` | Inspection records |
| `inspection_images` | Uploaded images (signed URLs) |
| `declarations` | Extracted label declarations |
| `violations` | Detected compliance violations |
| `evidence` | Violation-to-image evidence links |
| `reports` | Generated reports |
| `compliance_rules` | Rule engine definitions |

All tables have RLS enabled via `002_profiles_rls_policies.sql`.

## Dependencies

```
fastapi>=0.100.0
uvicorn[standard]>=0.22.0
pydantic-settings>=2.0.0
python-dotenv>=1.0.0
supabase>=2.0.0
```
