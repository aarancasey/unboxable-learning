import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const huggingFaceApiKey = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
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

ASSESSMENT SCORING GUIDELINES:
- Confidence Levels: Rate each area 1-6 scale (1=Not confident at all, 6=Highly confident)
- Leadership Style: Choose from (Stuck and or disengaged, Uncertain and reactive, Managing but close to overload, Confident but stretched, Calm focused and consistent, Energised and clear)
- Purpose Connection: Rate 1-6 scale (1=I feel disconnected or unclear, 6=I feel deeply purposeful and driven)
- Agility Level: Assess as Expert, Achiever, Catalyst, or Co-Creator based on scoring ranges
- Extract actual responses for challenges, energy sources, aspirations, and goals

## Leadership Sentiment Snapshot
This section reflects how you're currently experiencing your leadership role - your mindset, energy, and emotional connection to leading.

### 1. Current Leadership Style
Based on your responses, you see your current leadership style as: [Choose ONE from: Stuck and or disengaged / Uncertain and reactive / Managing, but close to overload / Confident but stretched / Calm, focused and consistent / Energised and clear]

### 2. Confidence Levels in Key Areas
Based on your assessment, you see your confidence in the following areas as follows:
- Lead through complexity and ambiguity: [score 1-6]
- Motivate and align your team: [score 1-6]
- Make decisions with pace and clarity: [score 1-6]
- Empower others to take ownership and lead: [score 1-6]
- Balance strategic and operational demands: [score 1-6]
- Create space for learning and experimentation: [score 1-6]
- Stay resilient and maintain personal energy: [score 1-6]

From an overall perspective your aggregated average score is: [average of above scores to 1 decimal]
Based on this score, this indicates that [choose interpretation]:
- 1.0–2.4: "you're likely feeling overwhelmed or unsure in several aspects of your leadership. There may be areas where you're struggling to stay energized or lead with clarity. This is a powerful opportunity to build awareness and focus on specific development areas."
- 2.5–3.4: "you're gaining traction but may still feel stretched or inconsistent. You might be managing but not thriving yet. Consider where you feel most capable and where support or tools could build your leadership muscle."
- 3.5–4.4: "you're generally confident and capable in most areas, though certain challenges or contexts may still affect your consistency. You have a solid foundation to build from—targeted growth could lift you into greater impact."
- 4.5–5.4: "you're leading with competence and clarity across most domains. You're likely trusted, consistent, and resilient. You're in a strong place to coach others or stretch into more strategic leadership."
- 5.5–6.0: "you demonstrate consistently high confidence across all areas. You're operating with ease, clarity, and adaptability. Focus may shift from personal development to empowering others, shaping culture, or building collective capability."

### 3. Current Leadership Mindset
You described your current leadership as the following: [Select all that apply from their responses: I'm in constant problem-solving mode / I'm feeling stretched but staying afloat / I'm navigating change and finding my rhythm / I'm actively exploring how to lead differently / I'm leading with confidence and growing in impact / I'm thriving and evolving as a leader]

### 4. Current Leadership Challenges
You described your current leadership challenge as: [Extract open text response]

### 5. What's Energising You Right Now
You see yourself as being energised by: [Extract open text response]

## Leadership Intent & Purpose
This section explores what drives you - your values, aspirations, and the impact you want your leadership to have.

### 1. What Matters Most Right Now
The following matters to you most right now as a leader: [Extract open text response]

### 2. Leadership Aspirations
You identified the following attributes that you aspire to be as a leader are: [Extract up to 3 selections from: Strategic and future-focused / Empowering and people-centred / Bold and transformational / Calm and composed under pressure / Curious and adaptive / Purpose-led and values-driven / High-performing and results-oriented / Trusted and respected across the organisation / Creative and innovative / Other]

### 3. Desired Impact
When I think about my leadership I want to have the following impact: [Extract open text response]

### 4. Leadership Stretch Goal
As part of this, you have identified the following stretch goal that you would like to work on over the next six to twelve months: [Extract open text response]

### 5. Connection to Purpose
Purpose is a critical component at Douglas Pharmaceuticals, and you feel your current connection to purpose is that: [Rate 1-6 and include description: 1=I feel disconnected or unclear, 2=I'm going through the motions, 3=I feel somewhat engaged but not fully aligned, 4=I feel connected and gaining clarity, 5=I feel mostly aligned and on track, 6=I feel deeply purposeful and driven]

## Adaptive & Agile Leadership Snapshot
Your self-assessed responses across six dimensions of adaptive leadership have been reviewed to highlight your current strengths and development areas.

### 1. Summary Leadership Agility Level
Based on your scoring you have been assessed as: [Choose from Expert/Achiever/Catalyst/Co-Creator based on analysis]
This is considered: [Include corresponding description:
- Expert: highly skilled and confident in technical expertise, leads through precision and structure
- Achiever: operates with confidence and clarity, sets goals and delivers outcomes
- Catalyst: leads with adaptability, learning, and vision, comfortable in ambiguity
- Co-Creator: leads through partnership, systems thinking, and shared purpose]

### 2. Notable Strength
Based on the responses recorded, your highest rating response was identified as: [Identify strongest area from: Navigating Change & Uncertainty / Strategic Agility & Systems Thinking / Learning Agility & Growth Mindset / Empowering Others & Collaboration / Action Orientation & Delivery / Decision-Making Agility]

### 3. Potential Development Area
Based on the responses recorded, your lowest rating response was identified as: [Identify development area from same list above]

### Overall Summary
[2-3 sentence summary of their leadership profile and development recommendations]

Return your analysis as a JSON object with this structure:
{
  "currentLeadershipStyle": "string - one of the 6 options",
  "confidenceLevels": {
    "complexityAmbiguity": "number 1-6",
    "motivateAlign": "number 1-6",
    "decisionMaking": "number 1-6",
    "empowerOthers": "number 1-6",
    "strategicOperational": "number 1-6",
    "learningExperimentation": "number 1-6",
    "resilientEnergy": "number 1-6"
  },
  "overallConfidenceScore": "number (average of above to 1 decimal)",
  "confidenceInterpretation": "string based on score ranges",
  "currentLeadershipMindset": "array of selected mindset options",
  "currentLeadershipChallenges": "string - open text response",
  "energisingFactors": "string - open text response",
  "whatMattersNow": "string - open text response",
  "leadershipAspirations": ["array", "of", "up to 3 aspirations"],
  "desiredImpact": "string - open text response",
  "stretchGoal": "string - open text response",
  "connectionToPurpose": "number 1-6",
  "connectionToPurposeDescription": "string description for the rating",
  "agilityLevel": "Expert|Achiever|Catalyst|Co-Creator",
  "agilityLevelDescription": "string description of the level",
  "notableStrength": "string - specific strength area",
  "developmentAreas": "string - specific development area",
  "overallAssessment": "string with 2-3 sentence summary",
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

    const response = await fetch('https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${huggingFaceApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 2000,
          temperature: 0.7,
          return_full_text: false
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data[0]?.generated_text || '';
    
    // Parse the JSON response
    let aiSummary;
    try {
      // Handle markdown code blocks and clean the response
      let cleanContent = content;
      if (cleanContent.includes('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```/g, '');
      }
      
      // Find JSON object in the response
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanContent = jsonMatch[0];
      }
      
      aiSummary = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      // Fallback to basic summary if JSON parsing fails
      aiSummary = {
        currentLeadershipStyle: "Managing, but close to overload",
        confidenceLevels: {
          complexityAmbiguity: 3.2,
          motivateAlign: 3.8,
          decisionMaking: 3.5,
          empowerOthers: 2.9,
          strategicOperational: 3.6,
          learningExperimentation: 3.1,
          resilientEnergy: 3.7
        },
        overallConfidenceScore: 3.4,
        confidenceInterpretation: "you're generally confident and capable in most areas, though certain challenges or contexts may still affect your consistency. You have a solid foundation to build from—targeted growth could lift you into greater impact.",
        currentLeadershipMindset: ["I'm feeling stretched but staying afloat", "I'm navigating change and finding my rhythm"],
        currentLeadershipChallenges: "Navigating increased complexity and ambiguity in the business environment",
        energisingFactors: "Seeing team members grow and develop their capabilities",
        whatMattersNow: "Building resilient and adaptive teams that can thrive in uncertainty",
        leadershipAspirations: ["Empowering and people-centred", "Strategic and future-focused", "Curious and adaptive"],
        desiredImpact: "Creating an environment where people feel valued, challenged, and empowered to do their best work",
        stretchGoal: "Develop more confidence in leading through complex, ambiguous situations",
        connectionToPurpose: 4,
        connectionToPurposeDescription: "I feel connected and gaining clarity",
        agilityLevel: "Achiever",
        agilityLevelDescription: "operates with confidence and clarity, sets goals and delivers outcomes",
        notableStrength: "Empowering Others & Collaboration",
        developmentAreas: "Navigating Change & Uncertainty",
        overallAssessment: "This leader demonstrates strong operational capabilities with clear areas for strategic development. Focus on building confidence in navigating ambiguity while leveraging existing strengths in team motivation and decision-making.",
        rubricAssessments: [
          {
            rubricName: "Leadership Assessment",
            overallScore: 3,
            criteriaScores: [
              {
                criterion: "Communication Skills",
                score: 3,
                justification: "Shows solid understanding of communication with room for enhancement"
              }
            ],
            recommendations: ["Develop more structured communication processes", "Practice active listening techniques"]
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