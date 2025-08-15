-- Delete self-reflection section from survey configuration
UPDATE public.survey_configurations 
SET configuration = jsonb_set(
  configuration,
  '{sections}',
  (
    SELECT jsonb_agg(section)
    FROM jsonb_array_elements(configuration->'sections') AS section
    WHERE section->>'title' != 'Self-Reflection Questions'
  )
)
WHERE survey_type = 'leadership_assessment' AND is_active = true;