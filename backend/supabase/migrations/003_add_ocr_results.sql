-- 002_add_ocr_results.sql
-- Stores OCR output from inspection images (one row per image)

DROP TABLE IF EXISTS public.ocr_results;

CREATE TABLE public.ocr_results (
    ocr_result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES public.inspections(inspection_id) ON DELETE CASCADE,
    image_id TEXT NOT NULL,
    full_text TEXT NOT NULL DEFAULT '',
    blocks_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    avg_confidence NUMERIC(5, 4) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ocr_results_inspection_id ON public.ocr_results(inspection_id);
CREATE INDEX IF NOT EXISTS idx_ocr_results_image_id ON public.ocr_results(image_id);

ALTER TABLE public.ocr_results ENABLE ROW LEVEL SECURITY;
