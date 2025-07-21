import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessDocumentRequest {
  contentLibraryId: string;
  extractedContent: string;
  title: string;
}

interface KnowledgeEntry {
  title: string;
  content: string;
  knowledge_type: string;
  keywords: string[];
  summary?: string;
  confidence_score: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Document Knowledge Processing Function Started ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { contentLibraryId, extractedContent, title }: ProcessDocumentRequest = await req.json();
    
    console.log('Processing document:', title);
    console.log('Content length:', extractedContent.length);
    
    // Process the document content to extract knowledge
    const knowledgeEntries = await processDocumentContent(extractedContent, title);
    
    console.log('Extracted knowledge entries:', knowledgeEntries.length);
    
    // Store knowledge entries in the database
    const insertedEntries = [];
    
    for (const entry of knowledgeEntries) {
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert({
          content_library_id: contentLibraryId,
          title: entry.title,
          content: entry.content,
          knowledge_type: entry.knowledge_type,
          keywords: entry.keywords,
          summary: entry.summary,
          confidence_score: entry.confidence_score
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error inserting knowledge entry:', error);
        continue;
      }
      
      insertedEntries.push(data);
    }
    
    console.log('Successfully inserted knowledge entries:', insertedEntries.length);
    
    // Generate learning insights
    await generateLearningInsights(supabase, contentLibraryId, knowledgeEntries);
    
    return new Response(JSON.stringify({
      success: true,
      message: `Extracted ${insertedEntries.length} knowledge entries`,
      entries: insertedEntries
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in process-document-knowledge function:', error);
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

async function processDocumentContent(content: string, title: string): Promise<KnowledgeEntry[]> {
  const knowledgeEntries: KnowledgeEntry[] = [];
  
  // Clean and prepare text
  const cleanContent = content.replace(/\s+/g, ' ').trim();
  
  // Extract keywords using simple frequency analysis
  const keywords = extractKeywords(cleanContent);
  
  // Split content into logical sections
  const sections = splitIntoSections(cleanContent);
  
  // Generate summary
  const summary = generateSummary(cleanContent);
  
  // Process each section to extract knowledge
  for (const section of sections) {
    if (section.length < 50) continue;
    
    const sectionKeywords = extractKeywords(section);
    const knowledgeType = determineKnowledgeType(section);
    const sectionTitle = generateSectionTitle(section);
    const confidence = calculateConfidence(section, knowledgeType);
    
    knowledgeEntries.push({
      title: sectionTitle,
      content: section,
      knowledge_type: knowledgeType,
      keywords: sectionKeywords.slice(0, 5),
      summary: section.length > 200 ? section.substring(0, 200) + '...' : section,
      confidence_score: confidence
    });
  }
  
  // Add overall document knowledge entry
  knowledgeEntries.push({
    title: title || 'Document Overview',
    content: summary,
    knowledge_type: 'concept',
    keywords: keywords.slice(0, 10),
    summary,
    confidence_score: 0.8
  });
  
  return knowledgeEntries.slice(0, 20); // Limit to 20 entries per document
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !isStopWord(word));
  
  const wordCount: Record<string, number> = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([word]) => word);
}

function splitIntoSections(content: string): string[] {
  // Split by paragraphs and meaningful breaks
  let sections = content.split(/\n\s*\n|\. [A-Z]/).filter(s => s.trim().length > 0);
  
  // If no clear sections, split by sentence groups
  if (sections.length < 3) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    sections = [];
    
    for (let i = 0; i < sentences.length; i += 3) {
      const sectionSentences = sentences.slice(i, i + 3);
      if (sectionSentences.length > 0) {
        sections.push(sectionSentences.join('. ').trim() + '.');
      }
    }
  }
  
  return sections.filter(s => s.length > 50);
}

function generateSummary(content: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  // Take first 2 sentences and last sentence as summary
  const firstTwo = sentences.slice(0, 2).join('. ');
  const lastOne = sentences.length > 3 ? sentences[sentences.length - 1] : '';
  
  let summary = firstTwo;
  if (lastOne && !firstTwo.includes(lastOne.substring(0, 20))) {
    summary += '. ' + lastOne;
  }
  
  return summary.length > 300 ? summary.substring(0, 300) + '...' : summary;
}

function determineKnowledgeType(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('definition') || lowerContent.includes('is defined as') || 
      lowerContent.includes('means') || lowerContent.includes('refers to')) {
    return 'definition';
  }
  
  if (lowerContent.includes('process') || lowerContent.includes('steps') || 
      lowerContent.includes('procedure') || lowerContent.includes('method')) {
    return 'process';
  }
  
  if (lowerContent.includes('research') || lowerContent.includes('study') || 
      lowerContent.includes('data') || lowerContent.includes('evidence')) {
    return 'fact';
  }
  
  return 'concept';
}

function generateSectionTitle(content: string): string {
  const firstSentence = content.split(/[.!?]/)[0];
  const words = firstSentence.split(' ').slice(0, 8);
  const title = words.join(' ');
  return title.length > 60 ? title.substring(0, 57) + '...' : title;
}

function calculateConfidence(content: string, knowledgeType: string): number {
  let confidence = 0.5;
  
  // Boost confidence for longer, more detailed content
  if (content.length > 200) confidence += 0.1;
  if (content.length > 500) confidence += 0.1;
  
  // Boost confidence based on knowledge type indicators
  const lowerContent = content.toLowerCase();
  if (knowledgeType === 'definition' && (lowerContent.includes('defined') || lowerContent.includes('definition'))) {
    confidence += 0.2;
  }
  
  if (knowledgeType === 'fact' && (lowerContent.includes('research') || lowerContent.includes('study'))) {
    confidence += 0.2;
  }
  
  if (knowledgeType === 'process' && (lowerContent.includes('step') || lowerContent.includes('process'))) {
    confidence += 0.2;
  }
  
  return Math.min(confidence, 1.0);
}

function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
    'by', 'from', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 
    'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 
    'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 
    'each', 'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 
    'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now'
  ]);
  return stopWords.has(word);
}

async function generateLearningInsights(supabase: any, contentLibraryId: string, knowledgeEntries: KnowledgeEntry[]) {
  try {
    // Generate insights based on the knowledge extracted
    const insights = [];
    
    // Pattern: Check for recurring themes
    const allKeywords = knowledgeEntries.flatMap(entry => entry.keywords);
    const keywordFreq: Record<string, number> = {};
    allKeywords.forEach(keyword => {
      keywordFreq[keyword] = (keywordFreq[keyword] || 0) + 1;
    });
    
    const topKeywords = Object.entries(keywordFreq)
      .filter(([, count]) => count > 1)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    if (topKeywords.length > 0) {
      insights.push({
        insight_type: 'pattern',
        title: 'Recurring Themes Identified',
        description: `Found recurring themes: ${topKeywords.map(([keyword]) => keyword).join(', ')}. These concepts appear multiple times throughout the document, suggesting they are central topics.`,
        related_documents: [contentLibraryId],
        confidence: 0.8
      });
    }
    
    // Knowledge type distribution
    const typeDistribution: Record<string, number> = {};
    knowledgeEntries.forEach(entry => {
      typeDistribution[entry.knowledge_type] = (typeDistribution[entry.knowledge_type] || 0) + 1;
    });
    
    const dominantType = Object.entries(typeDistribution)
      .sort(([, a], [, b]) => b - a)[0];
    
    if (dominantType && dominantType[1] > 2) {
      insights.push({
        insight_type: 'summary',
        title: `Document Focus: ${dominantType[0].charAt(0).toUpperCase() + dominantType[0].slice(1)}s`,
        description: `This document primarily contains ${dominantType[0]}s (${dominantType[1]} entries), indicating it focuses on ${dominantType[0] === 'definition' ? 'explaining key terms' : dominantType[0] === 'process' ? 'describing procedures' : dominantType[0] === 'fact' ? 'presenting factual information' : 'exploring concepts'}.`,
        related_documents: [contentLibraryId],
        confidence: 0.7
      });
    }
    
    // Insert insights into database
    for (const insight of insights) {
      await supabase
        .from('learning_insights')
        .insert(insight);
    }
    
    console.log('Generated learning insights:', insights.length);
  } catch (error) {
    console.error('Error generating learning insights:', error);
  }
}