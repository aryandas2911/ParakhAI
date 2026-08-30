-- 005_restructure_declarations_jsonb.sql
-- Restructure declarations to one row per image with JSONB, like ocr_results.

-- Drop old per-type rows
DROP TABLE IF EXISTS public.declarations;

-- Recreate with JSONB structure
CREATE TABLE public.declarations (
    declaration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES public.inspections(inspection_id) ON DELETE CASCADE,
    image_id TEXT NOT NULL,
    declarations_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    avg_confidence NUMERIC(5, 4) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_declarations_inspection_id ON public.declarations(inspection_id);
CREATE INDEX IF NOT EXISTS idx_declarations_image_id ON public.declarations(image_id);

ALTER TABLE public.declarations ENABLE ROW LEVEL SECURITY;
