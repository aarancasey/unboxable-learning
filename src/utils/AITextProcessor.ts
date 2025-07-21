import { pipeline, env } from '@huggingface/transformers';

// Configure transformers to use client-side models
env.allowRemoteModels = false;
env.allowLocalModels = true;

interface ProcessedText {
  keywords: string[];
  summary: string;
  concepts: Array<{
    title: string;
    content: string;
    type: 'concept' | 'fact' | 'process' | 'definition';
    confidence: number;
  }>;
}

export class AITextProcessor {
  private static summarizer: any = null;
  private static classifier: any = null;
  
  static async initialize() {
    console.log('Initializing AI text processor...');
    try {
      // Initialize summarization pipeline
      this.summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6', {
        device: 'webgpu',
        dtype: 'fp16'
      });
      
      // Initialize text classification for keyword extraction
      this.classifier = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        device: 'webgpu',
        dtype: 'fp16'
      });
      
      console.log('AI text processor initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize WebGPU, falling back to CPU:', error);
      try {
        this.summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');
        this.classifier = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('AI text processor initialized with CPU backend');
      } catch (cpuError) {
        console.error('Failed to initialize AI text processor:', cpuError);
        throw cpuError;
      }
    }
  }

  static async processDocument(content: string, title: string): Promise<ProcessedText> {
    if (!this.summarizer || !this.classifier) {
      await this.initialize();
    }

    console.log('Processing document:', title);
    
    try {
      // Clean and prepare text
      const cleanContent = this.cleanText(content);
      const chunks = this.chunkText(cleanContent, 1000);
      
      // Generate summary
      const summary = await this.generateSummary(chunks);
      
      // Extract keywords
      const keywords = this.extractKeywords(cleanContent);
      
      // Extract concepts
      const concepts = await this.extractConcepts(chunks, title);
      
      return {
        keywords,
        summary,
        concepts
      };
    } catch (error) {
      console.error('Error processing document:', error);
      // Fallback to simple text processing
      return this.fallbackProcessing(content, title);
    }
  }

  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\.\,\!\?\-\(\)]/g, '')
      .trim();
  }

  private static chunkText(text: string, maxLength: number): string[] {
    const sentences = text.split(/[.!?]+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxLength && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence + '. ';
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private static async generateSummary(chunks: string[]): Promise<string> {
    try {
      const summaries = await Promise.all(
        chunks.slice(0, 3).map(async (chunk) => {
          if (chunk.length < 50) return chunk;
          
          const result = await this.summarizer(chunk, {
            max_length: 100,
            min_length: 30,
            do_sample: false
          });
          
          return result[0]?.summary_text || chunk.substring(0, 100) + '...';
        })
      );
      
      return summaries.join(' ');
    } catch (error) {
      console.error('Error generating summary:', error);
      return chunks[0]?.substring(0, 200) + '...' || '';
    }
  }

  private static extractKeywords(text: string): string[] {
    // Simple keyword extraction based on word frequency and importance
    const words = text.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3 && !this.isStopWord(word));
    
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private static async extractConcepts(chunks: string[], title: string): Promise<Array<{
    title: string;
    content: string;
    type: 'concept' | 'fact' | 'process' | 'definition';
    confidence: number;
  }>> {
    const concepts = [];
    
    for (const chunk of chunks.slice(0, 5)) {
      // Simple heuristic-based concept extraction
      const sentences = chunk.split(/[.!?]+/).filter(s => s.trim().length > 20);
      
      for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (trimmed.length < 30) continue;
        
        let type: 'concept' | 'fact' | 'process' | 'definition' = 'concept';
        let confidence = 0.7;
        
        // Determine type based on patterns
        if (trimmed.includes('is defined as') || trimmed.includes('means') || trimmed.includes('refers to')) {
          type = 'definition';
          confidence = 0.9;
        } else if (trimmed.includes('process') || trimmed.includes('steps') || trimmed.includes('procedure')) {
          type = 'process';
          confidence = 0.8;
        } else if (trimmed.includes('fact') || trimmed.includes('research shows') || trimmed.includes('studies indicate')) {
          type = 'fact';
          confidence = 0.85;
        }
        
        concepts.push({
          title: this.generateConceptTitle(trimmed),
          content: trimmed,
          type,
          confidence
        });
        
        if (concepts.length >= 10) break;
      }
      
      if (concepts.length >= 10) break;
    }
    
    return concepts;
  }

  private static generateConceptTitle(content: string): string {
    const words = content.split(' ').slice(0, 8);
    const title = words.join(' ');
    return title.length > 50 ? title.substring(0, 47) + '...' : title;
  }

  private static isStopWord(word: string): boolean {
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

  private static fallbackProcessing(content: string, title: string): ProcessedText {
    const cleanContent = this.cleanText(content);
    const keywords = this.extractKeywords(cleanContent);
    const summary = cleanContent.substring(0, 200) + '...';
    
    const concepts = [{
      title: title || 'Document Content',
      content: cleanContent.substring(0, 500) + '...',
      type: 'concept' as const,
      confidence: 0.5
    }];
    
    return { keywords, summary, concepts };
  }
}