import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Bulk upload function started')
    
    // Initialize Supabase client with service role key for full access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { learners } = await req.json()
    console.log('Received learners for bulk upload:', learners)
    
    if (!learners || !Array.isArray(learners)) {
      throw new Error('Invalid learners data')
    }
    
    // Insert all learners directly without RLS restrictions
    const { data, error } = await supabase
      .from('learners')
      .insert(learners)
      .select()
    
    if (error) {
      console.error('Error inserting learners:', error)
      throw error
    }
    
    console.log('Successfully inserted learners:', data)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        count: data.length,
        learners: data 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
    
  } catch (error) {
    console.error('Bulk upload error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})