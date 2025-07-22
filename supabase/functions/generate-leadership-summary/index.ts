import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to fetch relevant content from the library
async function fetchContentLibrary() {
  try {
    const { data: contentData, error } = await supabase
      .from('content_library')
      .select(`
        title,
        content_type,
        extracted_content,
        tags,
        content_categories (
          name,
          framework_section
        )
      `)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching content library:', error);
      return '';
    }

    if (!contentData || contentData.length === 0) {
      return 'No additional content library available.';
    }

    // Format content for AI consumption
    const formattedContent = contentData.map(item => {
      const category = item.content_categories?.name || 'General';
      const section = item.content_categories?.framework_section || 'general';
      
      return `
=== ${item.title} (${item.content_type}) ===
Category: ${category} (${section})
Tags: ${item.tags?.join(', ') || 'None'}

Content:
${item.extracted_content}
`;
    }).join('\n');

    return formattedContent;
  } catch (error) {
    console.error('Error in fetchContentLibrary:', error);
    return 'Content library temporarily unavailable.';
  }
}

// Function to fetch assessment rubrics
async function fetchAssessmentRubrics() {
  try {
    const { data: rubricsData, error } = await supabase
      .from('assessment_rubrics')
      .select('id, name, criteria, scoring_scale')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assessment rubrics:', error);
      return '';
    }

    if (!rubricsData || rubricsData.length === 0) {
      return 'No assessment rubrics available.';
    }

    // Format rubrics for AI consumption
    const formattedRubrics = rubricsData.map(rubric => {
      const criteriaText = rubric.criteria.map((criterion: any) => 
        `- ${criterion.criterion}: ${criterion.description}`
      ).join('\n');
      
      const scaleText = rubric.scoring_scale.map((scale: any) => 
        `Level ${scale.level} (${scale.descriptor}): ${scale.description}`
      ).join('\n');

      return `
=== ${rubric.name} Assessment Rubric ===
Assessment Criteria:
${criteriaText}

Scoring Scale:
${scaleText}
`;
    }).join('\n');

    return formattedRubrics;
  } catch (error) {
    console.error('Error in fetchAssessmentRubrics:', error);
    return 'Assessment rubrics temporarily unavailable.';
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { surveyResponses, surveyTitle } = await req.json();

    // Fetch relevant content from the content library and assessment rubrics
    const [contentLibraryData, assessmentRubrics] = await Promise.all([
      fetchContentLibrary(),
      fetchAssessmentRubrics()
    ]);

    // Build comprehensive prompt enhanced with content library and assessment rubrics
    const prompt = `As a professional leadership development expert, analyze the following survey responses and create a comprehensive leadership assessment summary following the LEADForward framework structure. The summary should be professional, personalized, and actionable.

IMPORTANT: Use the provided content library and assessment rubrics below to enhance your analysis with specific frameworks, methodologies, and assessment criteria. Reference and apply the relevant content to make the assessment more accurate and valuable.

=== CONTENT LIBRARY ===
${contentLibraryData}
=== END CONTENT LIBRARY ===

=== ASSESSMENT RUBRICS ===
${assessmentRubrics}
=== END ASSESSMENT RUBRICS ===

Survey Title: ${surveyTitle}
Survey Responses:
${surveyResponses.map((r: any) => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n')}

Please provide a comprehensive analysis following this exact structure:

## Leadership Sentiment Snapshot
Analyze how they're currently experiencing their leadership role - mindset, energy, and emotional connection.

### Current Leadership Style
[Describe their leadership style based on their responses - 2-3 sentences about their approach]

### Confidence Rating
[Provide a rating from 1-6 scale: 1=Emerging Confidence, 2-3=Developing Confidence, 4-5=Growing Confidence, 6=Strong Confidence]

### Strongest Area
[Identify their top strength area based on responses]

### Area to Focus On
[Identify their primary development area]

## Leadership Intent & Purpose
Explore what drives them - values, aspirations, and desired impact.

### Leadership Aspirations
[List 3-4 key aspirations based on their responses as an array]

### Connection to Purpose Rating
[Provide rating 1-6: 1-2=Seeking clarity, 3-4=Connected and gaining clarity, 5-6=Deeply connected]

## Adaptive & Agile Leadership Snapshot
Analyze their agility across six dimensions.

### Leadership Agility Level
[Determine: Expert, Achiever, Catalyst, or Co-Creator based on their responses]

### Notable Strengths (Top 3)
[List their top 3 leadership strengths as an array]

### Development Areas (Focus Areas)
[List 3 key development areas as an array]

### Overall Assessment
[Provide a comprehensive 2-3 sentence summary of their leadership profile and readiness for development]

## Assessment Rubric Scores
Based on the assessment rubrics provided, evaluate the person against each rubric and provide specific scores for each criterion. For each rubric, provide:
- Overall rubric score (1-5 scale)
- Individual criterion scores with brief justification
- Specific recommendations for improvement

Return your analysis as a JSON object with this structure:
{
  "currentLeadershipStyle": "string",
  "confidenceRating": "string with rating and description",
  "strongestArea": "string",
  "focusArea": "string", 
  "leadershipAspirations": ["array", "of", "aspirations"],
  "purposeRating": "number 1-6",
  "agilityLevel": "Expert|Achiever|Catalyst|Co-Creator",
  "topStrengths": ["array", "of", "top", "strengths"],
  "developmentAreas": ["array", "of", "development", "areas"],
  "overallAssessment": "string with comprehensive summary",
  "rubricAssessments": [
    {
      "rubricName": "string",
      "overallScore": "number 1-5",
      "criteriaScores": [
        {
          "criterion": "string",
          "score": "number 1-5",
          "justification": "string explaining the score"
        }
      ],
      "recommendations": ["array", "of", "specific", "recommendations"]
    }
  ]
}

Make the analysis personal, specific to their responses, and professionally written.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional leadership development expert specializing in creating comprehensive leadership assessments. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    let aiSummary;
    try {
      aiSummary = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      // Fallback to basic summary if JSON parsing fails
      aiSummary = {
        currentLeadershipStyle: "Balanced approach combining strategic thinking with people-centered values",
        confidenceRating: "Developing Confidence (3-4)",
        strongestArea: "Team motivation and collaborative decision-making",
        focusArea: "Leading through complexity and ambiguity",
        leadershipAspirations: ["Empowering and people-centred", "Strategic and future-focused", "Curious and adaptive"],
        purposeRating: 4,
        agilityLevel: "Achiever",
        topStrengths: ["Action Orientation & Delivery", "Decision-Making Agility", "Empowering Others & Collaboration"],
        developmentAreas: ["Navigating Change & Uncertainty", "Strategic Agility & Systems Thinking", "Learning Agility & Growth Mindset"],
        overallAssessment: "This leader demonstrates strong operational capabilities with clear areas for strategic development. Focus on building confidence in navigating ambiguity while leveraging existing strengths in team motivation and decision-making.",
        rubricAssessments: [
          {
            rubricName: "Strategic Thinking & Vision",
            overallScore: 3,
            criteriaScores: [
              {
                criterion: "Develops and communicates clear organizational vision",
                score: 3,
                justification: "Shows solid understanding of strategic direction with room for enhancement"
              }
            ],
            recommendations: ["Develop more structured strategic planning processes", "Practice articulating vision more clearly"]
          }
        ]
      };
    }

    console.log('Generated AI summary:', aiSummary);

    return new Response(JSON.stringify({ aiSummary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-leadership-summary function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});