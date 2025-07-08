-- First, let's check if we have any courses in the database
SELECT * FROM courses;

-- If empty, insert a default leadership course
INSERT INTO courses (
  title,
  description,
  duration,
  max_enrollment,
  status,
  module_list
) VALUES (
  'Leadership Development Course',
  'Complete the pre-course assessment and unlock learning modules',
  '4 weeks',
  20,
  'active',
  '[
    {
      "id": "1",
      "title": "Leadership Sentiment, Adaptive and Agile Self-Assessment",
      "type": "survey",
      "duration": "45 min",
      "description": "Comprehensive leadership self-assessment covering sentiment, purpose, and agility",
      "status": "active"
    },
    {
      "id": "2",
      "title": "Unlock",
      "type": "document",
      "duration": "60 min",
      "status": "active",
      "description": "Lead with greater self-awareness. Explore how your mindset, strengths, and habits shape the way you lead—so you can lead with clearer intent and direction.",
      "content": {"files": []}
    },
    {
      "id": "3",
      "title": "Align",
      "type": "document",
      "duration": "60 min",
      "status": "active",
      "description": "Lead with others. Build collective thinking, align as a leadership team, and strengthen how you problem-solve and make decisions together.",
      "content": {"files": []}
    },
    {
      "id": "4",
      "title": "Accelerate",
      "type": "document",
      "duration": "20 min",
      "status": "active",
      "description": "Lead through others. Focus on how you enable others to deliver, lead through change, and bring strategy, purpose, and culture to life in everyday work.",
      "content": {"files": []}
    },
    {
      "id": "5",
      "title": "Deliver",
      "type": "document",
      "duration": "22 min",
      "status": "active",
      "description": "Lead for outcomes. Strengthen planning, risk, stakeholder engagement, and commercial thinking to connect leadership with real-world delivery.",
      "content": {"files": []}
    }
  ]'::jsonb
) 
ON CONFLICT DO NOTHING;