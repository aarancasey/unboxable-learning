import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  extractedContent: string;
  documentTitle: string;
}

interface Category {
  name: string;
  description: string;
  framework_section: string;
}

interface AssessmentRubric {
  name: string;
  criteria: Record<string, any>;
  scoring_scale: Record<string, any>;
  category_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!openAIApiKey) {
    console.error('OpenAI API key not found');
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { extractedContent, documentTitle }: AnalysisRequest = await req.json();
    
    if (!extractedContent) {
      return new Response(
        JSON.stringify({ error: 'Missing extractedContent' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing document:', documentTitle);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, analyze and create categories
    const categoriesResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert in leadership assessment and organizational development. Analyze the provided document and extract 3-6 main categories that represent the key areas or framework sections for leadership assessment.

Return your response as a JSON array of category objects, each with:
- name: A concise category name (2-4 words)
- description: Brief description of what this category covers
- framework_section: The section/area of the leadership framework this relates to

Focus on leadership competencies, skills, behaviors, or assessment areas mentioned in the document.`
          },
          {
            role: 'user',
            content: `Document Title: ${documentTitle}\n\nContent:\n${extractedContent}`
          }
        ],
        temperature: 0.3,
      }),
    });

    const categoriesData = await categoriesResponse.json();
    console.log('Categories AI response:', categoriesData);

    let categories: Category[] = [];
    try {
      categories = JSON.parse(categoriesData.choices[0].message.content);
    } catch (e) {
      console.error('Failed to parse categories JSON:', e);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response for categories' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert categories into database
    const insertedCategories: any[] = [];
    for (const category of categories) {
      const { data, error } = await supabase
        .from('content_categories')
        .insert({
          name: category.name,
          description: category.description,
          framework_section: category.framework_section
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting category:', error);
      } else {
        insertedCategories.push(data);
      }
    }

    // Now analyze and create assessment rubrics
    const rubricsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert in leadership assessment and rubric design. Analyze the provided document and create 4-8 detailed assessment rubrics based on the leadership competencies, skills, or behaviors mentioned.

Each rubric should have:
- name: Clear, specific rubric name for a leadership competency
- criteria: JSON object with detailed assessment criteria including:
  - description: What this competency involves
  - indicators: Array of observable behaviors/indicators
  - development_areas: Key areas for development
- scoring_scale: JSON object with scale levels (typically 1-5 or 1-6) where each level has:
  - level number as key
  - description of performance at that level

Focus on creating comprehensive, actionable rubrics that can be used for 360-degree feedback and leadership development.

Categories available:
${insertedCategories.map(cat => `- ${cat.name}: ${cat.description}`).join('\n')}

Return a JSON array of rubric objects.`
          },
          {
            role: 'user',
            content: `Document Title: ${documentTitle}\n\nContent:\n${extractedContent}`
          }
        ],
        temperature: 0.3,
      }),
    });

    const rubricsData = await rubricsResponse.json();
    console.log('Rubrics AI response:', rubricsData);

    let rubrics: AssessmentRubric[] = [];
    try {
      rubrics = JSON.parse(rubricsData.choices[0].message.content);
    } catch (e) {
      console.error('Failed to parse rubrics JSON:', e);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response for rubrics' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert rubrics into database
    const insertedRubrics: any[] = [];
    for (const rubric of rubrics) {
      // Try to match rubric to a category based on name similarity
      const matchedCategory = insertedCategories.find(cat => 
        rubric.name.toLowerCase().includes(cat.name.toLowerCase()) ||
        cat.name.toLowerCase().includes(rubric.name.toLowerCase().split(' ')[0])
      );

      const { data, error } = await supabase
        .from('assessment_rubrics')
        .insert({
          name: rubric.name,
          criteria: rubric.criteria,
          scoring_scale: rubric.scoring_scale,
          category_id: matchedCategory?.id || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting rubric:', error);
      } else {
        insertedRubrics.push(data);
      }
    }

    console.log(`Created ${insertedCategories.length} categories and ${insertedRubrics.length} rubrics`);

    return new Response(
      JSON.stringify({
        success: true,
        categories: insertedCategories,
        rubrics: insertedRubrics,
        message: `Successfully created ${insertedCategories.length} categories and ${insertedRubrics.length} assessment rubrics`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in analyze-document-content function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});