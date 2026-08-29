# ParakhAI Frontend

Next.js 16 App Router frontend for the Legal Metrology Compliance Engine.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion (animations)
- Lucide Icons

## Getting Started

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Run dev server:

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Project Structure

```
frontend/
├── app/
│   ├── auth/                   # Login/signup pages
│   ├── dashboard/              # Executive dashboard
│   ├── help/                   # In-app documentation
│   ├── inspections/
│   │   ├── page.tsx            # Inspections list
│   │   ├── new/
│   │   │   ├── page.tsx        # New inspection (product + image upload)
│   │   │   └── components/     # ImageCaptureZone, CameraCaptureModal
│   │   └── [id]/
│   │       ├── page.tsx        # Inspection detail (Product Analysis)
│   │       └── components/     # EvidenceFrameCard, EvidenceViewerModal, etc.
│   ├── login/                  # Legacy login ( redirects to /auth )
│   ├── reports/                # Report listing + detail
│   ├── settings/               # Rule engine config
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/layout/
│   ├── AppShell.tsx            # Main app layout wrapper
│   ├── Sidebar.tsx             # Navigation sidebar
│   └── Header.tsx              # Top navigation bar
├── context/
│   └── AuthContext.tsx          # Supabase Auth context provider
├── lib/
│   ├── api.ts                  # Backend API client functions
│   ├── supabase.ts             # Supabase server client
│   └── supabaseClient.ts       # Supabase browser client
├── public/                     # Static assets
└── package.json
```

## Pages

| Route | Description |
|-------|-------------|
| `/auth` | Login/signup portal |
| `/dashboard` | Executive dashboard with compliance metrics |
| `/inspections` | Inspections list |
| `/inspections/new` | Create new inspection with image upload |
| `/inspections/[id]` | Product Analysis detail view |
| `/reports` | Report listing |
| `/reports/[id]` | Report detail |
| `/settings` | Rule engine configuration |
| `/help` | In-app documentation |

## Inspection Detail View (`/inspections/[id]`)

The Product Analysis page shows:

- **Evidence Frame**: Displays uploaded images with zoom/pan controls, prev/next navigation between images, and image counter
- **Declaration Analysis Table**: Extracted label declarations (placeholder data)
- **Visual Checks Card**: Automated compliance checks (placeholder)
- **Compliance Findings Card**: Identified violations (placeholder)
- **Uploaded Images Grid**: All uploaded images with View/Remove actions on hover
- **Evidence Viewer Modal**: Full-screen image viewer with navigation, zoom, and thumbnail strip

## API Integration

All backend API calls are in `lib/api.ts`:

```typescript
// Auth
fetchMe(token)                     // GET /me

// Profile
fetchProfile(token)                // GET /api/profile
updateProfile(token, data)         // PATCH /api/products

// Products
createProduct(token, data)         // POST /api/products
fetchProducts(token)               // GET /api/products

// Inspections
createInspection(token, payload)   // POST /api/inspections
fetchInspections(token)            // GET /api/inspections
fetchInspectionById(token, id)     // GET /api/inspections/{id}

// Inspection Images
uploadInspectionImage(token, id, formData)  // POST /api/inspections/{id}/images
fetchInspectionImages(token, id)            // GET /api/inspections/{id}/images
deleteInspectionImage(token, id, imageId)   // DELETE /api/inspections/{id}/images/{imageId}
```

## Build

```bash
npm run build
```
