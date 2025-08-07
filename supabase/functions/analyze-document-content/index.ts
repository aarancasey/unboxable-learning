import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const huggingFaceApiKey = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
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
        huggingface_key_present: !!huggingFaceApiKey,
        supabase_url_present: !!supabaseUrl,
        supabase_key_present: !!supabaseServiceKey
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('Environment check:');
  console.log('- Hugging Face API key present:', !!huggingFaceApiKey);
  console.log('- Supabase URL present:', !!supabaseUrl);
  console.log('- Supabase service key present:', !!supabaseServiceKey);

  if (!huggingFaceApiKey) {
    console.error('❌ Hugging Face API key not found');
    return new Response(
      JSON.stringify({ error: 'Hugging Face API key not configured' }),
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
    const { extractedContent, documentTitle, contentLibraryId }: AnalysisRequest & { contentLibraryId?: string } = await req.json();
    
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
    console.log('🧠 Step 1: Generating categories with Hugging Face...');
    
    const truncatedContent = extractedContent.substring(0, 4000); // Limit content for better performance
    console.log('📏 Using truncated content length:', truncatedContent.length, 'characters');
    
    const categoriesPrompt = `You are an expert in leadership assessment and organizational development. Analyze the provided document and extract 3-6 main categories that represent the key areas or framework sections for leadership assessment.

Return your response as a JSON array of category objects, each with:
- name: A concise category name (2-4 words)
- description: Brief description of what this category covers
- framework_section: Choose the most appropriate from: "sentiment", "purpose", "agility", "development", "assessment"
- confidence_score: A decimal between 0.0 and 1.0 indicating how confident you are this category is relevant (higher = more confident)

Focus on leadership competencies, skills, behaviors, or assessment areas mentioned in the document. Prioritize categories that are clearly defined and actionable for leadership development.

Document Title: ${documentTitle}

Content:
${truncatedContent}

Response (JSON only):`;

    let categoriesResponse;
    try {
      categoriesResponse = await fetch('https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${huggingFaceApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: categoriesPrompt,
          parameters: {
            max_new_tokens: 2000,
            temperature: 0.3,
            return_full_text: false
          }
        }),
      });
    } catch (fetchError) {
      console.error('❌ Network error calling Hugging Face for categories:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Network error calling Hugging Face for categories', details: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!categoriesResponse.ok) {
      console.error('❌ Hugging Face API error for categories:', categoriesResponse.status, categoriesResponse.statusText);
      const errorText = await categoriesResponse.text();
      console.error('Error details:', errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Hugging Face API error for categories', 
          status: categoriesResponse.status,
          statusText: categoriesResponse.statusText,
          details: errorText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const categoriesData = await categoriesResponse.json();
    console.log('✅ Categories AI response received:', JSON.stringify(categoriesData, null, 2));

    let categories: Category[] = [];
    let rawContent = categoriesData[0]?.generated_text || '';
    console.log('📝 Raw categories content:', rawContent);

    try {
      // Handle markdown code blocks and clean the response
      if (rawContent.includes('```json')) {
        rawContent = rawContent.replace(/```json\n?/g, '').replace(/```/g, '');
        console.log('🔧 Cleaned markdown from categories response');
      }
      
      // Find JSON array in the response
      const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        rawContent = jsonMatch[0];
      }
      
      categories = JSON.parse(rawContent);
      console.log('✅ Successfully parsed categories:', categories.length, 'items');
    } catch (e) {
      console.error('❌ Failed to parse categories JSON:', e);
      console.error('Raw content that failed to parse:', rawContent);
      
      // Fallback: Create basic categories
      console.log('🔄 Creating fallback categories...');
      categories = [
        {
          name: "Leadership Excellence",
          description: "Core leadership competencies and behaviors",
          framework_section: "development"
        },
        {
          name: "Strategic Thinking", 
          description: "Strategic planning and decision-making abilities",
          framework_section: "agility"
        },
        {
          name: "Communication Skills",
          description: "Effective communication and interpersonal skills",
          framework_section: "sentiment"
        }
      ];
      console.log(`🛠️ Created ${categories.length} fallback categories`);
    }

    // Insert categories into database
    console.log('💾 Step 2: Inserting categories into database...');
    const insertedCategories: any[] = [];
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      console.log(`📝 Inserting category ${i + 1}/${categories.length}:`, category.name);
      
      // Check for duplicate categories before inserting
      const { data: existingCategory } = await supabase
        .from('content_categories')
        .select('id, name')
        .ilike('name', category.name)
        .single();

      if (existingCategory) {
        console.log(`📋 Category "${category.name}" already exists, skipping insertion`);
        insertedCategories.push(existingCategory);
        continue;
      }

      const { data, error } = await supabase
        .from('content_categories')
        .insert({
          name: category.name,
          description: category.description,
          framework_section: category.framework_section,
          ai_generated: true,
          source_document_id: contentLibraryId || null,
          confidence_score: (category as any).confidence_score || 0.8
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
    console.log('🧠 Step 3: Generating rubrics with Hugging Face...');
    
    const rubricsPrompt = `You are an expert in leadership assessment and rubric design. Analyze the provided document and create 4-8 detailed assessment rubrics based on the leadership competencies, skills, or behaviors mentioned.

Each rubric should have:
- name: Clear, specific rubric name for a leadership competency
- criteria: JSON object with detailed assessment criteria including:
  - description: What this competency involves
  - indicators: Array of observable behaviors/indicators
  - development_areas: Key areas for development
- scoring_scale: JSON object with scale levels (1-5) where each level has:
  - level number as key
  - description of performance at that level

Focus on creating comprehensive, actionable rubrics that can be used for 360-degree feedback and leadership development.

Categories available:
${insertedCategories.map(cat => `- ${cat.name}: ${cat.description}`).join('\n')}

Document Title: ${documentTitle}

Content:
${extractedContent.substring(0, 3000)}

Response (JSON array only):`;

    const rubricsResponse = await fetch('https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${huggingFaceApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: rubricsPrompt,
        parameters: {
          max_new_tokens: 3000,
          temperature: 0.3,
          return_full_text: false
        }
      }),
    });

    if (!rubricsResponse.ok) {
      console.error('❌ Hugging Face API error for rubrics:', rubricsResponse.status, rubricsResponse.statusText);
      const errorText = await rubricsResponse.text();
      console.error('Error details:', errorText);
      
      // Create fallback rubrics
      console.log('🔄 Creating fallback rubrics...');
      const fallbackRubrics = insertedCategories.map((cat, index) => ({
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
      
      // Insert fallback rubrics
      const insertedRubrics: any[] = [];
      for (const rubric of fallbackRubrics) {
        const { data, error } = await supabase
          .from('assessment_rubrics')
          .insert({
            name: rubric.name,
            criteria: rubric.criteria,
            scoring_scale: rubric.scoring_scale,
            category_id: insertedCategories.find(cat => rubric.name.includes(cat.name))?.id || null
          })
          .select()
          .single();

        if (!error && data) {
          insertedRubrics.push(data);
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          categories: insertedCategories,
          rubrics: insertedRubrics,
          message: `Successfully created ${insertedCategories.length} categories and ${insertedRubrics.length} assessment rubrics (using fallback)`,
          stats: {
            categoriesCreated: insertedCategories.length,
            rubricsCreated: insertedRubrics.length,
            documentTitle: documentTitle
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rubricsData = await rubricsResponse.json();
    console.log('✅ Rubrics AI response received:', JSON.stringify(rubricsData, null, 2));

    let rubrics: AssessmentRubric[] = [];
    let rawRubricsContent = rubricsData[0]?.generated_text || '';
    console.log('📝 Raw rubrics content:', rawRubricsContent);

    try {
      // Handle markdown code blocks and clean the response
      if (rawRubricsContent.includes('```json')) {
        rawRubricsContent = rawRubricsContent.replace(/```json\n?/g, '').replace(/```/g, '');
        console.log('🔧 Cleaned markdown from rubrics response');
      }
      
      // Find JSON array in the response
      const jsonMatch = rawRubricsContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        rawRubricsContent = jsonMatch[0];
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