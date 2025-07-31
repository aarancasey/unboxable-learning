-- Add fields to track AI-generated categories and their source
ALTER TABLE content_categories ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE content_categories ADD COLUMN IF NOT EXISTS source_document_id UUID REFERENCES content_library(id);
ALTER TABLE content_categories ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2);
ALTER TABLE content_categories ADD COLUMN IF NOT EXISTS suggested_merge_candidates TEXT[];

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_content_categories_ai_generated ON content_categories(ai_generated);
CREATE INDEX IF NOT EXISTS idx_content_categories_source_document ON content_categories(source_document_id);