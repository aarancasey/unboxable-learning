-- Remove the circular foreign key relationship that's causing ambiguity
-- Keep content_library.category_id -> content_categories.id
-- Remove content_categories.source_document_id foreign key constraint but keep the column for tracking

DO $$
DECLARE
    constraint_name_var text;
BEGIN
    -- Find the constraint name for source_document_id
    SELECT tc.constraint_name INTO constraint_name_var
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'content_categories' 
    AND kcu.column_name = 'source_document_id'
    AND tc.constraint_type = 'FOREIGN KEY';
    
    -- Drop the constraint if it exists
    IF constraint_name_var IS NOT NULL THEN
        EXECUTE format('ALTER TABLE content_categories DROP CONSTRAINT %I', constraint_name_var);
    END IF;
END $$;