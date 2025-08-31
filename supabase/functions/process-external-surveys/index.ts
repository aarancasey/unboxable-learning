import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { uploadId, surveyData, rubricIds } = await req.json();
    console.log('Processing external survey upload:', uploadId);

    // Update upload status to processing
    await supabase
      .from('external_survey_uploads')
      .update({ processing_status: 'processing' })
      .eq('id', uploadId);

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };

    // Process each survey response
    for (const [index, surveyResponse] of surveyData.entries()) {
      try {
        results.processed++;
        console.log(`Processing survey ${index + 1}/${surveyData.length}`);

        // Map external data to internal survey format
        const mappedResponse = mapExternalToInternal(surveyResponse);
        
        // Create survey submission
        const { data: submission, error: submissionError } = await supabase
          .from('survey_submissions')
          .insert({
            learner_name: mappedResponse.learner_name,
            learner_id: null, // External surveys don't have internal learner IDs
            responses: mappedResponse.responses,
            status: 'pending',
            data_source: 'external',
            external_upload_id: uploadId,
            submitted_at: mappedResponse.submitted_at || new Date().toISOString()
          })
          .select()
          .single();

        if (submissionError) throw submissionError;

        // Process with each selected rubric
        for (const rubricId of rubricIds || []) {
          await processWithRubric(submission.id, rubricId, mappedResponse);
        }

        results.successful++;
        
        // Update progress
        await supabase
          .from('external_survey_uploads')
          .update({ 
            processed_records: results.processed,
            successful_records: results.successful,
            failed_records: results.failed
          })
          .eq('id', uploadId);

      } catch (error) {
        results.failed++;
        results.errors.push({
          row: index + 1,
          error: error.message,
          data: surveyResponse
        });
        console.error(`Error processing survey ${index + 1}:`, error);
      }
    }

    // Final status update
    const finalStatus = results.failed === 0 ? 'completed' : 'completed_with_errors';
    await supabase
      .from('external_survey_uploads')
      .update({
        processing_status: finalStatus,
        processed_records: results.processed,
        successful_records: results.successful,
        failed_records: results.failed,
        error_log: results.errors
      })
      .eq('id', uploadId);

    console.log('Processing complete:', results);

    return new Response(JSON.stringify({
      success: true,
      results,
      message: `Processed ${results.processed} records. ${results.successful} successful, ${results.failed} failed.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-external-surveys function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function mapExternalToInternal(externalData: any) {
  // Standard mapping - can be enhanced based on common external formats
  return {
    learner_name: externalData.name || externalData.participant_name || externalData.full_name || 'Unknown',
    submitted_at: externalData.date || externalData.submitted_at || new Date().toISOString(),
    responses: {
      participantInfo: {
        fullName: externalData.name || externalData.participant_name || externalData.full_name,
        company: externalData.company || externalData.organization || '',
        role: externalData.role || externalData.position || externalData.title || '',
        businessArea: externalData.business_area || externalData.department || '',
        date: externalData.date || new Date().toISOString().split('T')[0]
      },
      answers: mapAnswers(externalData)
    }
  };
}

function mapAnswers(externalData: any) {
  const answers: any = {};
  
  // Direct mapping for survey questions - preserve exact field names from the UI mapping
  const directMappings = [
    // Leadership Sentiment
    'sentiment_1', 'sentiment_2', 'sentiment_3', 'sentiment_4', 'sentiment_5',
    // Purpose  
    'purpose_1', 'purpose_2', 'purpose_3', 'purpose_4', 'purpose_5',
    // Agility
    'agility_1', 'agility_2', 'agility_3', 'agility_4', 'agility_5', 'agility_6',
    // Leadership Competencies
    'communication_skills', 'emotional_intelligence', 'strategic_thinking',
    'innovation_capability', 'conflict_management', 'coaching_capability', 'influence_skills'
  ];

  // Legacy pattern matching for fields that weren't directly mapped
  const patternMappings = [
    { patterns: ['leadership_style', 'current_style'], target: 'sentiment_1' },
    { patterns: ['confidence', 'leadership_confidence'], target: 'sentiment_2' },
    { patterns: ['mindset', 'leadership_mindset'], target: 'sentiment_3' },
    { patterns: ['challenging', 'challenges', 'difficult'], target: 'sentiment_4' },
    { patterns: ['exciting', 'energising', 'motivating'], target: 'sentiment_5' },
    { patterns: ['matters_most', 'important', 'priority'], target: 'purpose_1' },
    { patterns: ['aspirational', 'want_to_be', 'future_style'], target: 'purpose_2' },
    { patterns: ['values', 'core_values'], target: 'purpose_3' },
    { patterns: ['legacy', 'impact', 'remembered'], target: 'purpose_4' },
    { patterns: ['purpose_rating', 'purpose_score'], target: 'purpose_5' },
    { patterns: ['decision_making', 'decisions'], target: 'agility_1' },
    { patterns: ['complex_problems', 'complexity'], target: 'agility_2' },
    { patterns: ['team_dynamics', 'team_work'], target: 'agility_3' },
    { patterns: ['change_leadership', 'leading_change'], target: 'agility_4' },
    { patterns: ['learning', 'experimentation'], target: 'agility_5' },
    { patterns: ['stakeholder', 'stakeholders'], target: 'agility_6' },
    { patterns: ['communication', 'communicate'], target: 'communication_skills' },
    { patterns: ['emotional_intelligence', 'eq', 'emotions'], target: 'emotional_intelligence' },
    { patterns: ['strategic', 'strategy'], target: 'strategic_thinking' },
    { patterns: ['innovation', 'creative', 'creativity'], target: 'innovation_capability' },
    { patterns: ['conflict', 'conflict_resolution'], target: 'conflict_management' },
    { patterns: ['coaching', 'feedback', 'development'], target: 'coaching_capability' },
    { patterns: ['influence', 'persuasion', 'influencing'], target: 'influence_skills' }
  ];

  // First, directly map any fields that match our survey question IDs
  Object.keys(externalData).forEach(key => {
    if (directMappings.includes(key)) {
      answers[key] = externalData[key];
    }
  });

  // Then, use pattern matching for other fields
  Object.keys(externalData).forEach(key => {
    if (directMappings.includes(key)) return; // Skip already mapped fields
    
    const lowerKey = key.toLowerCase();
    
    // Skip basic participant info fields
    if (['name', 'company', 'role', 'date', 'participant_name', 'full_name', 'organization', 'position', 'title', 'business_area', 'department', 'email'].includes(lowerKey)) {
      return;
    }
    
    // Find matching pattern
    const mapping = patternMappings.find(m => 
      m.patterns.some(pattern => lowerKey.includes(pattern))
    );
    
    if (mapping && !answers[mapping.target]) { // Don't override direct mappings
      answers[mapping.target] = externalData[key];
    } else if (!mapping) {
      // Include unmapped fields with original key for assessment
      answers[key] = externalData[key];
    }
  });

  return answers;
}

async function processWithRubric(submissionId: number, rubricId: string, mappedResponse: any) {
  try {
    console.log(`Processing submission ${submissionId} with rubric ${rubricId}`);
    
    // Get rubric details
    const { data: rubric, error: rubricError } = await supabase
      .from('assessment_rubrics')
      .select('*')
      .eq('id', rubricId)
      .single();

    if (rubricError) throw rubricError;

    // Generate AI assessment
    const assessment = await generateRubricAssessment(mappedResponse, rubric);
    
    // Store the assessment
    const { error: assessmentError } = await supabase
      .from('rubric_assessments')
      .insert({
        survey_submission_id: submissionId,
        rubric_id: rubricId,
        overall_score: assessment.overallScore,
        max_possible_score: assessment.maxPossibleScore,
        percentage_score: assessment.percentageScore,
        criterion_scores: assessment.criterionScores,
        assessment_summary: assessment.summary,
        strengths: assessment.strengths,
        areas_for_improvement: assessment.areasForImprovement,
        recommendations: assessment.recommendations,
        confidence_score: assessment.confidenceScore,
        processing_metadata: {
          processedAt: new Date().toISOString(),
          model: 'gpt-5-2025-08-07',
          processingTime: Date.now()
        }
      });

    if (assessmentError) throw assessmentError;

    console.log(`Successfully processed submission ${submissionId} with rubric ${rubricId}`);
  } catch (error) {
    console.error(`Error processing rubric assessment:`, error);
    throw error;
  }
}

async function generateRubricAssessment(surveyResponse: any, rubric: any) {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `
You are an expert assessment evaluator. Analyze the following survey response against the provided rubric and generate a comprehensive assessment.

SURVEY RESPONSE:
Participant: ${surveyResponse.learner_name}
Company: ${surveyResponse.responses.participantInfo?.company || 'Not specified'}
Role: ${surveyResponse.responses.participantInfo?.role || 'Not specified'}

Responses:
${JSON.stringify(surveyResponse.responses.answers, null, 2)}

ASSESSMENT RUBRIC:
Name: ${rubric.name}
Criteria: ${JSON.stringify(rubric.criteria, null, 2)}
Scoring Scale: ${JSON.stringify(rubric.scoring_scale, null, 2)}

Please provide a detailed assessment in the following JSON format:
{
  "overallScore": <numeric score>,
  "maxPossibleScore": <maximum possible score based on rubric>,
  "percentageScore": <percentage score>,
  "criterionScores": {
    "<criterion_name>": {
      "score": <numeric score>,
      "maxScore": <max for this criterion>,
      "rationale": "<explanation of score>",
      "evidence": "<specific evidence from responses>"
    }
  },
  "summary": "<overall assessment summary>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "areasForImprovement": ["<area 1>", "<area 2>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...],
  "confidenceScore": <0-1 confidence in assessment>
}

Focus on providing specific, actionable feedback based on the survey responses and rubric criteria.
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-2025-08-07',
      messages: [
        { role: 'system', content: 'You are an expert assessment evaluator specializing in leadership and professional development assessments.' },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const assessmentText = data.choices[0].message.content;

  try {
    // Extract JSON from the response
    const jsonMatch = assessmentText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    console.error('Error parsing AI assessment:', parseError);
    console.log('Raw AI response:', assessmentText);
    
    // Fallback assessment
    return {
      overallScore: 0,
      maxPossibleScore: rubric.scoring_scale.maxPoints * rubric.criteria.length,
      percentageScore: 0,
      criterionScores: {},
      summary: 'Assessment could not be completed due to parsing error',
      strengths: [],
      areasForImprovement: ['Assessment needs manual review'],
      recommendations: ['Please review this assessment manually'],
      confidenceScore: 0
    };
  }
}