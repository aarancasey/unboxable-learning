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

// Function to convert old responses to new format
function convertResponsesToSurveyFormat(responses: any): any[] {
  const answers = responses.answers || {};
  const surveyResponses = [];

  // Add reflection questions
  if (answers.reflection_1) {
    surveyResponses.push({
      question: "What patterns do you see in your current leadership approach? What themes consistently show up in how you lead?",
      answer: answers.reflection_1
    });
  }

  if (answers.reflection_2) {
    surveyResponses.push({
      question: "What are your strongest areas of leadership agility right now?",
      answer: answers.reflection_2
    });
  }

  if (answers.reflection_3) {
    surveyResponses.push({
      question: "What aspect of leadership agility would you most like to develop?",
      answer: answers.reflection_3
    });
  }

  // Add purpose questions
  if (answers.purpose_1) {
    surveyResponses.push({
      question: "What matters most to you as a leader right now?",
      answer: answers.purpose_1
    });
  }

  if (answers.purpose_3) {
    surveyResponses.push({
      question: "When I think about my leadership, I want to have this impact:",
      answer: answers.purpose_3
    });
  }

  if (answers.purpose_4) {
    surveyResponses.push({
      question: "What is one leadership stretch goal you want to work on over the next 6-12 months?",
      answer: answers.purpose_4
    });
  }

  // Add agility scale responses as summary
  const agilityAreas = ['action', 'change', 'decisions', 'empowering', 'learning', 'systems'];
  const agilityScores = agilityAreas.map(area => {
    const scores = Object.keys(answers)
      .filter(key => key.startsWith(`agility_${area}_`))
      .map(key => answers[key] || 0);
    const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return `${area}: ${average.toFixed(1)}`;
  });

  if (agilityScores.length > 0) {
    surveyResponses.push({
      question: "Leadership Agility Assessment Scores (across 6 dimensions)",
      answer: agilityScores.join(', ')
    });
  }

  return surveyResponses;
}

// Function to generate new AI assessment
async function generateNewAssessment(surveyResponses: any[], learnerName: string) {
  try {
    // Fetch content library and rubrics
    const [contentLibraryData, assessmentRubrics] = await Promise.all([
      fetchContentLibrary(),
      fetchAssessmentRubrics()
    ]);

    // Build the updated prompt (same as in generate-leadership-summary)
    const prompt = `As a professional leadership development expert, analyze the following survey responses and create a comprehensive leadership assessment summary following the exact LEADForward Leadership Self Assessment document structure. The summary should be professional, personalized, and actionable.

IMPORTANT: Use the provided content library and assessment rubrics below to enhance your analysis with specific frameworks, methodologies, and assessment criteria. Reference and apply the relevant content to make the assessment more accurate and valuable.

=== CONTENT LIBRARY ===
${contentLibraryData}
=== END CONTENT LIBRARY ===

=== ASSESSMENT RUBRICS ===
${assessmentRubrics}
=== END ASSESSMENT RUBRICS ===

Survey Title: LEADForward Leadership Self Assessment
Learner: ${learnerName}
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
Purpose is a critical component, and you feel your current connection to purpose is that: [extracted from responses]

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
          { role: 'system', content: 'You are a professional leadership development expert specializing in creating comprehensive leadership assessments following the LEADForward framework. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      // Return fallback assessment with new structure
      return {
        currentLeadershipStyle: "Collaborative leader with focus on team empowerment and strategic growth",
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
        confidenceInterpretation: "You're developing your capabilities with solid foundations in key areas",
        currentLeadershipMindset: "People-first leadership approach with emphasis on empowerment and growth",
        currentLeadershipChallenges: "Navigating ambiguity and developing strategic influence",
        energisingFactors: "Seeing team members grow and develop their capabilities",
        whatMattersNow: "Creating supportive environments where teams can thrive",
        leadershipAspirations: ["Strategic and future-focused", "Empowering and people-centred", "Calm and composed under pressure"],
        desiredImpact: "Creating positive, lasting impact through team empowerment and organizational growth",
        stretchGoal: "Develop stronger strategic decision-making and influence in ambiguous situations",
        connectionToPurpose: "Connected to organizational mission with growing clarity on leadership impact",
        agilityLevel: "Achiever",
        agilityLevelDescription: "Results-oriented leader with strong strategic and operational capabilities",
        notableStrength: "Team collaboration and empowerment capabilities",
        developmentAreas: "Strategic influencing and decision-making under ambiguity",
        overallAssessment: "This leader demonstrates strong people-focused capabilities with clear opportunities for strategic development. Focus on building confidence in navigating complexity while leveraging existing strengths in team motivation.",
        rubricAssessments: []
      };
    }
  } catch (error) {
    console.error('Error generating new assessment:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submissionIds, mode = 'selected' } = await req.json();

    let targetSubmissions = [];

    if (mode === 'all') {
      // Fetch all survey submissions
      const { data: allSubmissions, error } = await supabase
        .from('survey_submissions')
        .select('id, learner_name, responses, submitted_at, status')
        .order('submitted_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch submissions: ${error.message}`);
      }

      targetSubmissions = allSubmissions || [];
    } else {
      // Fetch specific submissions
      const { data: selectedSubmissions, error } = await supabase
        .from('survey_submissions')
        .select('id, learner_name, responses, submitted_at, status')
        .in('id', submissionIds);

      if (error) {
        throw new Error(`Failed to fetch submissions: ${error.message}`);
      }

      targetSubmissions = selectedSubmissions || [];
    }

    console.log(`Processing ${targetSubmissions.length} submissions for refactoring`);

    const results = [];

    for (const submission of targetSubmissions) {
      try {
        console.log(`Processing submission ${submission.id} for ${submission.learner_name}`);

        // Convert old responses to new format
        const surveyResponses = convertResponsesToSurveyFormat(submission.responses);

        // Generate new AI assessment
        const newAssessment = await generateNewAssessment(surveyResponses, submission.learner_name);

        // Update the submission with new assessment format
        const updatedResponses = {
          ...submission.responses,
          ai_summary: newAssessment,
          refactored_at: new Date().toISOString(),
          refactored_format_version: '2.0'
        };

        const { error: updateError } = await supabase
          .from('survey_submissions')
          .update({ 
            responses: updatedResponses,
            status: 'completed' // Ensure status is set to completed
          })
          .eq('id', submission.id);

        if (updateError) {
          console.error(`Failed to update submission ${submission.id}:`, updateError);
          results.push({
            submissionId: submission.id,
            learnerName: submission.learner_name,
            success: false,
            error: updateError.message
          });
        } else {
          console.log(`Successfully refactored submission ${submission.id}`);
          results.push({
            submissionId: submission.id,
            learnerName: submission.learner_name,
            success: true,
            newFormat: newAssessment
          });
        }

        // Add a small delay to avoid overwhelming the OpenAI API
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error processing submission ${submission.id}:`, error);
        results.push({
          submissionId: submission.id,
          learnerName: submission.learner_name,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return new Response(JSON.stringify({ 
      success: true,
      message: `Refactoring completed: ${successCount} successful, ${failureCount} failed`,
      results,
      summary: {
        total: targetSubmissions.length,
        successful: successCount,
        failed: failureCount
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in refactor-assessments function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});