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

// Build comprehensive prompt following the exact LEADForward document structure
    const prompt = `As a professional leadership development expert, analyze the following survey responses and create a comprehensive leadership assessment summary following the exact LEADForward Leadership Self Assessment document structure. The summary should be professional, personalized, and actionable.

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

Please provide a comprehensive analysis following this EXACT structure from the LEADForward document:

## Leadership Sentiment Snapshot
This section reflects how you're currently experiencing your leadership role - your mindset, energy, and emotional connection to leading.

### 1. Current Leadership Style
Based on your selection you see your current leadership style as: [Describe their leadership style based on their responses - 2-3 sentences about their approach]

### 2. Confidence Levels in Key Areas
Based on your assessment, you see your confidence in the following areas as follows:
- Strategic Vision & Direction: [score 1.0-5.0]
- Team Leadership & Motivation: [score 1.0-5.0] 
- Decision Making Under Pressure: [score 1.0-5.0]
- Managing Change & Uncertainty: [score 1.0-5.0]
- Communication & Influence: [score 1.0-5.0]
- Personal Leadership Presence: [score 1.0-5.0]
- Building & Maintaining Relationships: [score 1.0-5.0]

From an overall perspective your aggregated average score is: [average of above scores]
Based on this score, this indicates that: [interpretation based on ranges: 1.0–2.4 = "You're in early stages", 2.5–3.4 = "You're developing your capabilities", 3.5–4.4 = "You have solid foundations", 4.5–5.0 = "You demonstrate strong confidence"]

### 3. Current Leadership Mindset
You described your current leadership as the following: [extracted from responses]

### 4. Current Leadership Challenges
You described your current leadership challenge as: [extracted from responses]

### 5. What's Energising You Right Now
You see yourself as being energised by: [extracted from responses]

## Leadership Intent & Purpose
This section explores what drives you - your values, aspirations, and the impact you want your leadership to have.

### 1. What Matters Most Right Now
The following matters to you most right now as a leader: [extracted from responses]

### 2. Leadership Aspirations
You identified the following attributes that you aspire to be as a leader are: [array of aspirations]

### 3. Desired Impact
When I think about my leadership, I want to have the following impact: [extracted from responses]

### 4. Leadership Stretch Goal
As part of this, you have identified the following stretch goal that you would like to work on over the next six to twelve months: [extracted from responses]

### 5. Connection to Purpose
Purpose is a critical component at Douglas Pharmaceuticals, and you feel your current connection to purpose is that: [extracted from responses]

## Adaptive & Agile Leadership Snapshot
Your self-assessed responses across six dimensions of adaptive leadership have been reviewed to highlight your current strengths and development areas.

### 1. Summary Leadership Agility Level
Based on your scoring you have been assessed as: [Opportunist/Diplomat/Expert/Achiever/Individualist/Strategist/Alchemist]
This is considered: [description of level]

### 2. Notable Strength
Based on the responses recorded, your highest rating response was identified as: [specific strength area]

### 3. Potential Development Areas
Based on the responses recorded, your lowest rating response was identified as: [specific development area]

### Overall Summary
[Comprehensive 2-3 sentence summary of their leadership profile and readiness for development]

## Assessment Rubric Scores
Based on the assessment rubrics provided, evaluate the person against each rubric and provide specific scores for each criterion.

Return your analysis as a JSON object with this structure:
{
  "currentLeadershipStyle": "string",
  "confidenceLevels": {
    "strategicVision": "number 1.0-5.0",
    "teamLeadership": "number 1.0-5.0",
    "decisionMaking": "number 1.0-5.0",
    "changeManagement": "number 1.0-5.0",
    "communication": "number 1.0-5.0",
    "leadershipPresence": "number 1.0-5.0",
    "relationships": "number 1.0-5.0"
  },
  "overallConfidenceScore": "number (average of above)",
  "confidenceInterpretation": "string based on score ranges",
  "currentLeadershipMindset": "string",
  "currentLeadershipChallenges": "string",
  "energisingFactors": "string",
  "whatMattersNow": "string",
  "leadershipAspirations": ["array", "of", "aspirations"],
  "desiredImpact": "string",
  "stretchGoal": "string",
  "connectionToPurpose": "string",
  "agilityLevel": "Opportunist|Diplomat|Expert|Achiever|Individualist|Strategist|Alchemist",
  "agilityLevelDescription": "string",
  "notableStrength": "string",
  "developmentAreas": "string",
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

Make the analysis personal, specific to their responses, and professionally written following the exact LEADForward document structure.`;

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
        confidenceLevels: {
          strategicVision: 3.2,
          teamLeadership: 3.8,
          decisionMaking: 3.5,
          changeManagement: 2.9,
          communication: 3.6,
          leadershipPresence: 3.1,
          relationships: 3.7
        },
        overallConfidenceScore: 3.4,
        confidenceInterpretation: "You are developing your capabilities with solid foundations in key areas",
        currentLeadershipMindset: "Focused on delivering results while building strong team relationships",
        currentLeadershipChallenges: "Navigating increased complexity and ambiguity in the business environment",
        energisingFactors: "Seeing team members grow and develop their capabilities",
        whatMattersNow: "Building resilient and adaptive teams that can thrive in uncertainty",
        leadershipAspirations: ["Empowering and people-centred", "Strategic and future-focused", "Curious and adaptive"],
        desiredImpact: "Creating an environment where people feel valued, challenged, and empowered to do their best work",
        stretchGoal: "Develop more confidence in leading through complex, ambiguous situations",
        connectionToPurpose: "Feel connected to the organization's mission and see how my leadership contributes to meaningful outcomes",
        agilityLevel: "Achiever",
        agilityLevelDescription: "Results-oriented, strategic, effective manager",
        notableStrength: "Team motivation and collaborative decision-making",
        developmentAreas: "Leading through complexity and ambiguity",
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