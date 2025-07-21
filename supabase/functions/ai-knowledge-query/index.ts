import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QueryRequest {
  question: string;
  conversationId?: string;
  maxResults?: number;
}

interface KnowledgeResult {
  id: string;
  title: string;
  content: string;
  summary?: string;
  knowledge_type: string;
  keywords: string[];
  confidence_score: number;
  content_library_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== AI Knowledge Query Function Started ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { question, conversationId, maxResults = 5 }: QueryRequest = await req.json();
    
    console.log('Processing query:', question);
    
    // Search knowledge base for relevant information
    const relevantKnowledge = await searchKnowledgeBase(supabase, question, maxResults);
    
    console.log('Found relevant knowledge entries:', relevantKnowledge.length);
    
    // Generate response based on found knowledge
    const response = await generateResponse(question, relevantKnowledge);
    
    // Save conversation if conversationId provided
    let savedConversation = null;
    if (conversationId) {
      savedConversation = await saveConversation(supabase, conversationId, question, response, relevantKnowledge);
    }
    
    return new Response(JSON.stringify({
      success: true,
      response,
      sources: relevantKnowledge,
      conversation: savedConversation
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in ai-knowledge-query function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function searchKnowledgeBase(supabase: any, question: string, maxResults: number): Promise<KnowledgeResult[]> {
  // Extract keywords from the question
  const queryKeywords = extractQueryKeywords(question);
  console.log('Query keywords:', queryKeywords);
  
  // Search by keyword overlap
  const { data: keywordMatches, error: keywordError } = await supabase
    .from('knowledge_base')
    .select(`
      id,
      title,
      content,
      summary,
      knowledge_type,
      keywords,
      confidence_score,
      content_library_id
    `)
    .overlaps('keywords', queryKeywords)
    .order('confidence_score', { ascending: false })
    .limit(maxResults * 2);
  
  if (keywordError) {
    console.error('Error searching by keywords:', keywordError);
  }
  
  // Also search by text similarity in title and content
  const { data: textMatches, error: textError } = await supabase
    .from('knowledge_base')
    .select(`
      id,
      title,
      content,
      summary,
      knowledge_type,
      keywords,
      confidence_score,
      content_library_id
    `)
    .or(`title.ilike.%${question}%,content.ilike.%${question}%,summary.ilike.%${question}%`)
    .order('confidence_score', { ascending: false })
    .limit(maxResults);
  
  if (textError) {
    console.error('Error searching by text:', textError);
  }
  
  // Combine and deduplicate results
  const allMatches = [...(keywordMatches || []), ...(textMatches || [])];
  const uniqueMatches = new Map();
  
  for (const match of allMatches) {
    if (!uniqueMatches.has(match.id)) {
      // Calculate relevance score
      const relevanceScore = calculateRelevanceScore(question, match, queryKeywords);
      uniqueMatches.set(match.id, { ...match, relevanceScore });
    }
  }
  
  // Sort by relevance and return top results
  return Array.from(uniqueMatches.values())
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults);
}

function extractQueryKeywords(question: string): string[] {
  const words = question.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !isStopWord(word));
  
  return [...new Set(words)].slice(0, 10);
}

function calculateRelevanceScore(question: string, knowledge: any, queryKeywords: string[]): number {
  let score = knowledge.confidence_score * 0.3; // Base score from confidence
  
  const questionLower = question.toLowerCase();
  const titleLower = knowledge.title.toLowerCase();
  const contentLower = knowledge.content.toLowerCase();
  
  // Title match bonus
  if (titleLower.includes(questionLower.substring(0, 20))) {
    score += 0.3;
  }
  
  // Content relevance
  const contentWords = contentLower.split(/\s+/);
  const questionWords = questionLower.split(/\s+/);
  const commonWords = questionWords.filter(word => contentWords.includes(word));
  score += (commonWords.length / questionWords.length) * 0.2;
  
  // Keyword overlap bonus
  const keywordMatches = knowledge.keywords.filter((keyword: string) => 
    queryKeywords.includes(keyword.toLowerCase())
  );
  score += (keywordMatches.length / Math.max(queryKeywords.length, 1)) * 0.2;
  
  // Knowledge type bonus for question types
  if (questionLower.includes('what is') || questionLower.includes('define')) {
    if (knowledge.knowledge_type === 'definition') score += 0.2;
  }
  if (questionLower.includes('how to') || questionLower.includes('process')) {
    if (knowledge.knowledge_type === 'process') score += 0.2;
  }
  
  return Math.min(score, 1.0);
}

async function generateResponse(question: string, knowledgeResults: KnowledgeResult[]): Promise<string> {
  if (knowledgeResults.length === 0) {
    return "I don't have enough information in the knowledge base to answer that question. Please try asking about topics covered in the uploaded documents.";
  }
  
  // Construct response based on knowledge
  let response = `Based on the information in the knowledge base:\n\n`;
  
  if (knowledgeResults.length === 1) {
    const knowledge = knowledgeResults[0];
    response += `**${knowledge.title}**\n\n`;
    response += knowledge.summary || knowledge.content.substring(0, 300) + '...';
    
    if (knowledge.keywords.length > 0) {
      response += `\n\n*Key concepts: ${knowledge.keywords.slice(0, 5).join(', ')}*`;
    }
  } else {
    // Multiple sources
    response += `I found several relevant pieces of information:\n\n`;
    
    knowledgeResults.slice(0, 3).forEach((knowledge, index) => {
      response += `${index + 1}. **${knowledge.title}**\n`;
      response += `   ${knowledge.summary || knowledge.content.substring(0, 200) + '...'}\n\n`;
    });
    
    // Aggregate key concepts
    const allKeywords = knowledgeResults.flatMap(k => k.keywords);
    const uniqueKeywords = [...new Set(allKeywords)].slice(0, 8);
    if (uniqueKeywords.length > 0) {
      response += `*Related concepts: ${uniqueKeywords.join(', ')}*`;
    }
  }
  
  return response;
}

async function saveConversation(supabase: any, conversationId: string, question: string, response: string, sources: KnowledgeResult[]) {
  try {
    // Get or create conversation
    let conversation;
    if (conversationId === 'new') {
      const { data: newConv, error: convError } = await supabase
        .from('ai_conversations')
        .insert({
          title: question.substring(0, 50) + (question.length > 50 ? '...' : '')
        })
        .select()
        .single();
      
      if (convError) throw convError;
      conversation = newConv;
      conversationId = newConv.id;
    } else {
      const { data: existingConv, error: fetchError } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      
      if (fetchError) throw fetchError;
      conversation = existingConv;
    }
    
    // Save user message
    await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: question
      });
    
    // Save assistant response
    await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: response,
        sources: sources.map(s => s.id)
      });
    
    return conversation;
  } catch (error) {
    console.error('Error saving conversation:', error);
    return null;
  }
}

function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
    'by', 'from', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 
    'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 
    'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 
    'each', 'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 
    'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'what', 
    'who', 'which', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'myself', 
    'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'he', 
    'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself'
  ]);
  return stopWords.has(word);
}