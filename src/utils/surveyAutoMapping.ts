import { createQuestionMap } from './surveyQuestionMapper';

interface MappingSuggestion {
  columnHeader: string;
  suggestedMapping: string;
  confidence: number;
  matchReason: string;
}

// Calculate similarity between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  // Exact match
  if (s1 === s2) return 1.0;
  
  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;
  
  // Word overlap
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  const commonWords = words1.filter(word => 
    words2.some(w2 => w2.includes(word) || word.includes(w2))
  );
  
  const overlapRatio = commonWords.length / Math.max(words1.length, words2.length);
  
  // Bonus for key leadership terms
  const keyTerms = ['leadership', 'leader', 'team', 'decision', 'strategic', 'agility', 'mindset', 'confidence', 'purpose'];
  const hasKeyTerms = keyTerms.some(term => s1.includes(term) && s2.includes(term));
  
  return overlapRatio + (hasKeyTerms ? 0.1 : 0);
}

// Get all available survey questions with their mappings
export function getSurveyQuestionMappings() {
  const questionMap = createQuestionMap();
  const mappings: Record<string, { text: string; id: string }> = {};
  
  // Add participant info mappings
  mappings['participant_name'] = { text: 'Full Name', id: 'participant_name' };
  mappings['email'] = { text: 'Email', id: 'email' };
  mappings['role'] = { text: 'Role', id: 'role' };
  mappings['department'] = { text: 'Department', id: 'department' };
  mappings['employment_length'] = { text: 'Employment Length', id: 'employment_length' };
  mappings['company'] = { text: 'Company', id: 'company' };
  mappings['date'] = { text: 'Date', id: 'date' };
  
  // Add survey questions
  Object.entries(questionMap).forEach(([id, data]) => {
    mappings[id] = { text: data.question, id };
  });
  
  return mappings;
}

// Auto-map columns to survey questions using intelligent text matching
export function autoMapColumns(columnHeaders: string[]): Record<string, string> {
  const questionMappings = getSurveyQuestionMappings();
  const autoMapping: Record<string, string> = {};
  
  columnHeaders.forEach(header => {
    let bestMatch = { id: '', confidence: 0, reason: '' };
    
    // Check against all possible mappings
    Object.entries(questionMappings).forEach(([mappingId, mappingData]) => {
      const similarity = calculateSimilarity(header, mappingData.text);
      
      if (similarity > bestMatch.confidence && similarity > 0.4) { // Minimum 40% similarity
        bestMatch = {
          id: mappingId,
          confidence: similarity,
          reason: similarity >= 0.9 ? 'Exact match' : similarity >= 0.7 ? 'High similarity' : 'Good match'
        };
      }
    });
    
    // Additional pattern-based fallbacks for common variations
    if (bestMatch.confidence < 0.6) {
      const headerLower = header.toLowerCase();
      
      // Participant info patterns
      if (headerLower.includes('name') || headerLower.includes('participant')) {
        bestMatch = { id: 'participant_name', confidence: 0.8, reason: 'Name pattern' };
      } else if (headerLower.includes('email') || headerLower.includes('e-mail')) {
        bestMatch = { id: 'email', confidence: 0.8, reason: 'Email pattern' };
      } else if (headerLower.includes('company') || headerLower.includes('organization')) {
        bestMatch = { id: 'company', confidence: 0.8, reason: 'Company pattern' };
      } else if (headerLower.includes('role') || headerLower.includes('position') || headerLower.includes('title')) {
        bestMatch = { id: 'role', confidence: 0.8, reason: 'Role pattern' };
      } else if (headerLower.includes('department') || headerLower.includes('dept')) {
        bestMatch = { id: 'department', confidence: 0.8, reason: 'Department pattern' };
      } else if (headerLower.includes('employment') || headerLower.includes('tenure') || headerLower.includes('years')) {
        bestMatch = { id: 'employment_length', confidence: 0.8, reason: 'Employment pattern' };
      } else if (headerLower.includes('date') || headerLower.includes('submitted') || headerLower.includes('timestamp')) {
        bestMatch = { id: 'date', confidence: 0.8, reason: 'Date pattern' };
      }
      
      // Question-specific patterns
      else if (headerLower.includes('leadership style') && headerLower.includes('current')) {
        bestMatch = { id: 'sentiment_1', confidence: 0.8, reason: 'Leadership style pattern' };
      } else if (headerLower.includes('confidence') && headerLower.includes('leadership')) {
        bestMatch = { id: 'sentiment_2', confidence: 0.8, reason: 'Confidence pattern' };
      } else if (headerLower.includes('mindset') || (headerLower.includes('leadership') && headerLower.includes('approach'))) {
        bestMatch = { id: 'sentiment_3', confidence: 0.8, reason: 'Mindset pattern' };
      } else if (headerLower.includes('challeng') || headerLower.includes('difficult')) {
        bestMatch = { id: 'sentiment_4', confidence: 0.7, reason: 'Challenge pattern' };
      } else if (headerLower.includes('exciting') || headerLower.includes('energis') || headerLower.includes('motivat')) {
        bestMatch = { id: 'sentiment_5', confidence: 0.7, reason: 'Excitement pattern' };
      } else if (headerLower.includes('matters most') || (headerLower.includes('what') && headerLower.includes('leader'))) {
        bestMatch = { id: 'sentiment_6', confidence: 0.8, reason: 'What matters pattern' };
      } else if (headerLower.includes('purpose') && headerLower.includes('rating')) {
        bestMatch = { id: 'purpose_5', confidence: 0.8, reason: 'Purpose rating pattern' };
      }
    }
    
    // Only suggest mappings with reasonable confidence
    if (bestMatch.confidence >= 0.5) {
      autoMapping[header] = bestMatch.id;
    }
  });
  
  return autoMapping;
}

// Get detailed mapping suggestions for debugging
export function getMappingSuggestions(columnHeaders: string[]): MappingSuggestion[] {
  const questionMappings = getSurveyQuestionMappings();
  const suggestions: MappingSuggestion[] = [];
  
  columnHeaders.forEach(header => {
    let bestMatch = { id: '', confidence: 0, reason: '' };
    
    Object.entries(questionMappings).forEach(([mappingId, mappingData]) => {
      const similarity = calculateSimilarity(header, mappingData.text);
      
      if (similarity > bestMatch.confidence) {
        bestMatch = {
          id: mappingId,
          confidence: similarity,
          reason: similarity >= 0.9 ? 'Exact match' : similarity >= 0.7 ? 'High similarity' : 'Partial match'
        };
      }
    });
    
    suggestions.push({
      columnHeader: header,
      suggestedMapping: bestMatch.id,
      confidence: bestMatch.confidence,
      matchReason: bestMatch.reason
    });
  });
  
  return suggestions;
}