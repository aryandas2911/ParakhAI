-- 001_initial_schema.sql
-- SIH Legal Metrology Compliance System Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to handle updated_at timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'inspector',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. INSPECTIONS
CREATE TABLE IF NOT EXISTS public.inspections (
    inspection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
    inspector_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    inspection_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    compliance_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    compliance_score NUMERIC(5, 2) CHECK (compliance_score >= 0 AND compliance_score <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_inspections_updated_at
    BEFORE UPDATE ON public.inspections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. INSPECTION_IMAGES
CREATE TABLE IF NOT EXISTS public.inspection_images (
    image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES public.inspections(inspection_id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    image_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. DECLARATIONS
CREATE TABLE IF NOT EXISTS public.declarations (
    declaration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES public.inspections(inspection_id) ON DELETE CASCADE,
    declaration_type VARCHAR(100) NOT NULL,
    extracted_value TEXT NOT NULL,
    confidence NUMERIC(5, 4) CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. VIOLATIONS
CREATE TABLE IF NOT EXISTS public.violations (
    violation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES public.inspections(inspection_id) ON DELETE CASCADE,
    rule_reference VARCHAR(100) NOT NULL,
    violation_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    confidence NUMERIC(5, 4) CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. EVIDENCE
CREATE TABLE IF NOT EXISTS public.evidence (
    evidence_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    violation_id UUID NOT NULL REFERENCES public.violations(violation_id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES public.inspection_images(image_id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES public.inspections(inspection_id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    file_path TEXT NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. COMPLIANCE_RULES
CREATE TABLE IF NOT EXISTS public.compliance_rules (
    rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_reference VARCHAR(100) NOT NULL,
    product_category VARCHAR(100) NOT NULL,
    declaration_type VARCHAR(100) NOT NULL,
    validation_condition TEXT NOT NULL,
    violation_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    evidence_requirement TEXT,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_compliance_rules_updated_at
    BEFORE UPDATE ON public.compliance_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- INDEXES FOR RELATIONSHIPS AND COMMON QUERIES
CREATE INDEX IF NOT EXISTS idx_inspections_product_id ON public.inspections(product_id);
CREATE INDEX IF NOT EXISTS idx_inspections_inspector_id ON public.inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_inspection_images_inspection_id ON public.inspection_images(inspection_id);
CREATE INDEX IF NOT EXISTS idx_declarations_inspection_id ON public.declarations(inspection_id);
CREATE INDEX IF NOT EXISTS idx_violations_inspection_id ON public.violations(inspection_id);
CREATE INDEX IF NOT EXISTS idx_evidence_violation_id ON public.evidence(violation_id);
CREATE INDEX IF NOT EXISTS idx_evidence_image_id ON public.evidence(image_id);
CREATE INDEX IF NOT EXISTS idx_reports_inspection_id ON public.reports(inspection_id);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_category ON public.compliance_rules(product_category);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_rules ENABLE ROW LEVEL SECURITY;
