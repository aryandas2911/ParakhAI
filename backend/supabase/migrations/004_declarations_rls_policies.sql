-- 004_declarations_rls_policies.sql
-- Add RLS policies for declarations table to allow authenticated users
-- to manage declarations for their own inspections.

-- Allow authenticated users to read declarations for their own inspections
CREATE POLICY "declarations_select_own" ON public.declarations
    FOR SELECT
    TO authenticated
    USING (
        inspection_id IN (
            SELECT inspection_id FROM public.inspections
            WHERE inspector_id = auth.uid()
        )
    );

-- Allow authenticated users to insert declarations for their own inspections
CREATE POLICY "declarations_insert_own" ON public.declarations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        inspection_id IN (
            SELECT inspection_id FROM public.inspections
            WHERE inspector_id = auth.uid()
        )
    );

-- Allow authenticated users to update declarations for their own inspections
CREATE POLICY "declarations_update_own" ON public.declarations
    FOR UPDATE
    TO authenticated
    USING (
        inspection_id IN (
            SELECT inspection_id FROM public.inspections
            WHERE inspector_id = auth.uid()
        )
    )
    WITH CHECK (
        inspection_id IN (
            SELECT inspection_id FROM public.inspections
            WHERE inspector_id = auth.uid()
        )
    );

-- Allow authenticated users to delete declarations for their own inspections
CREATE POLICY "declarations_delete_own" ON public.declarations
    FOR DELETE
    TO authenticated
    USING (
        inspection_id IN (
            SELECT inspection_id FROM public.inspections
            WHERE inspector_id = auth.uid()
        )
    );
