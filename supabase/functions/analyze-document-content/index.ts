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
  console.log('=== Document Analysis Function Started ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  // Add a simple health check endpoint
  if (req.url.includes('health')) {
    console.log('Health check requested');
    return new Response(
      JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        openai_key_present: !!openAIApiKey,
        supabase_url_present: !!supabaseUrl,
        supabase_key_present: !!supabaseServiceKey
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('Environment check:');
  console.log('- OpenAI API key present:', !!openAIApiKey);
  console.log('- Supabase URL present:', !!supabaseUrl);
  console.log('- Supabase service key present:', !!supabaseServiceKey);

  if (!openAIApiKey) {
    console.error('❌ OpenAI API key not found');
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase configuration incomplete');
    return new Response(
      JSON.stringify({ error: 'Supabase configuration incomplete' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('✅ All environment variables found');

  try {
    console.log('📥 Parsing request body...');
    const { extractedContent, documentTitle }: AnalysisRequest = await req.json();
    
    if (!extractedContent) {
      console.error('❌ Missing extractedContent in request');
      return new Response(
        JSON.stringify({ error: 'Missing extractedContent' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📄 Analyzing document:', documentTitle);
    console.log('📊 Content length:', extractedContent.length, 'characters');

    // Initialize Supabase client
    console.log('🔗 Initializing Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, analyze and create categories
    console.log('🧠 Step 1: Generating categories with OpenAI...');
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

    if (!categoriesResponse.ok) {
      console.error('❌ OpenAI API error for categories:', categoriesResponse.status, categoriesResponse.statusText);
      const errorText = await categoriesResponse.text();
      console.error('Error details:', errorText);
      return new Response(
        JSON.stringify({ error: 'OpenAI API error for categories' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const categoriesData = await categoriesResponse.json();
    console.log('✅ Categories AI response received:', JSON.stringify(categoriesData, null, 2));

    if (!categoriesData.choices || !categoriesData.choices[0] || !categoriesData.choices[0].message) {
      console.error('❌ Invalid OpenAI response structure for categories');
      return new Response(
        JSON.stringify({ error: 'Invalid AI response structure for categories' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let categories: Category[] = [];
    let rawContent = categoriesData.choices[0].message.content;
    console.log('📝 Raw categories content:', rawContent);

    try {
      // Handle markdown code blocks
      if (rawContent.includes('```json')) {
        rawContent = rawContent.replace(/```json\n?/g, '').replace(/```/g, '');
        console.log('🔧 Cleaned markdown from categories response');
      }
      
      categories = JSON.parse(rawContent);
      console.log('✅ Successfully parsed categories:', categories.length, 'items');
    } catch (e) {
      console.error('❌ Failed to parse categories JSON:', e);
      console.error('Raw content that failed to parse:', rawContent);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response for categories', details: e.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert categories into database
    console.log('💾 Step 2: Inserting categories into database...');
    const insertedCategories: any[] = [];
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      console.log(`📝 Inserting category ${i + 1}/${categories.length}:`, category.name);
      
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
        console.error(`❌ Error inserting category "${category.name}":`, error);
      } else {
        console.log(`✅ Successfully inserted category:`, data.id);
        insertedCategories.push(data);
      }
    }
    
    console.log(`📊 Categories summary: ${insertedCategories.length}/${categories.length} successfully inserted`);

    // Now analyze and create assessment rubrics
    console.log('🧠 Step 3: Generating rubrics with OpenAI...');
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

    if (!rubricsResponse.ok) {
      console.error('❌ OpenAI API error for rubrics:', rubricsResponse.status, rubricsResponse.statusText);
      const errorText = await rubricsResponse.text();
      console.error('Error details:', errorText);
      return new Response(
        JSON.stringify({ error: 'OpenAI API error for rubrics' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rubricsData = await rubricsResponse.json();
    console.log('✅ Rubrics AI response received:', JSON.stringify(rubricsData, null, 2));

    if (!rubricsData.choices || !rubricsData.choices[0] || !rubricsData.choices[0].message) {
      console.error('❌ Invalid OpenAI response structure for rubrics');
      return new Response(
        JSON.stringify({ error: 'Invalid AI response structure for rubrics' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let rubrics: AssessmentRubric[] = [];
    let rawRubricsContent = rubricsData.choices[0].message.content;
    console.log('📝 Raw rubrics content:', rawRubricsContent);

    try {
      // Handle markdown code blocks
      if (rawRubricsContent.includes('```json')) {
        rawRubricsContent = rawRubricsContent.replace(/```json\n?/g, '').replace(/```/g, '');
        console.log('🔧 Cleaned markdown from rubrics response');
      }
      
      rubrics = JSON.parse(rawRubricsContent);
      console.log('✅ Successfully parsed rubrics:', rubrics.length, 'items');
    } catch (e) {
      console.error('❌ Failed to parse rubrics JSON:', e);
      console.error('Raw content that failed to parse:', rawRubricsContent);
      
      // Fallback: Create basic rubrics if parsing fails
      console.log('🔄 Creating fallback rubrics...');
      rubrics = insertedCategories.map((cat, index) => ({
        name: `${cat.name} Assessment`,
        criteria: {
          description: `Assessment criteria for ${cat.name}`,
          indicators: [`Demonstrates ${cat.name.toLowerCase()} competency`],
          development_areas: [`${cat.name} development focus areas`]
        },
        scoring_scale: {
          "1": "Needs significant development",
          "2": "Below expectations",
          "3": "Meets expectations", 
          "4": "Exceeds expectations",
          "5": "Outstanding performance"
        }
      }));
      console.log(`🛠️ Created ${rubrics.length} fallback rubrics`);
    }

    // Insert rubrics into database
    console.log('💾 Step 4: Inserting rubrics into database...');
    const insertedRubrics: any[] = [];
    
    for (let i = 0; i < rubrics.length; i++) {
      const rubric = rubrics[i];
      console.log(`📝 Inserting rubric ${i + 1}/${rubrics.length}:`, rubric.name);
      
      // Try to match rubric to a category based on name similarity
      const matchedCategory = insertedCategories.find(cat => 
        rubric.name.toLowerCase().includes(cat.name.toLowerCase()) ||
        cat.name.toLowerCase().includes(rubric.name.toLowerCase().split(' ')[0])
      );
      
      if (matchedCategory) {
        console.log(`🔗 Matched rubric "${rubric.name}" to category "${matchedCategory.name}"`);
      } else {
        console.log(`⚠️ No category match found for rubric "${rubric.name}" - creating without category`);
      }

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
        console.error(`❌ Error inserting rubric "${rubric.name}":`, error);
      } else {
        console.log(`✅ Successfully inserted rubric:`, data.id);
        insertedRubrics.push(data);
      }
    }
    
    console.log(`📊 Rubrics summary: ${insertedRubrics.length}/${rubrics.length} successfully inserted`);

    console.log(`🎉 Analysis completed successfully!`);
    console.log(`📈 Final results: ${insertedCategories.length} categories, ${insertedRubrics.length} rubrics`);
    console.log('=== Document Analysis Function Completed ===');

    return new Response(
      JSON.stringify({
        success: true,
        categories: insertedCategories,
        rubrics: insertedRubrics,
        message: `Successfully created ${insertedCategories.length} categories and ${insertedRubrics.length} assessment rubrics`,
        stats: {
          categoriesCreated: insertedCategories.length,
          rubricsCreated: insertedRubrics.length,
          documentTitle: documentTitle
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('💥 Critical error in analyze-document-content function:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});