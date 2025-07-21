import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Send, User, Bot, FileText, Lightbulb } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    id: string;
    title: string;
    knowledge_type: string;
    keywords: string[];
  }>;
  timestamp: Date;
}

export const AIKnowledgeChat = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('new');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-knowledge-query', {
        body: {
          question: userMessage.content,
          conversationId,
          maxResults: 5
        }
      });

      if (error) throw error;

      if (data.conversation && conversationId === 'new') {
        setConversationId(data.conversation.id);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        sources: data.sources,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.sources.length === 0) {
        toast({
          title: "Limited Knowledge",
          description: "No relevant information found in the knowledge base for this query.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error querying AI:', error);
      toast({
        title: "Query Failed",
        description: "Failed to get response from AI. Please try again.",
        variant: "destructive"
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error while processing your question. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationId('new');
    toast({
      title: "New Conversation",
      description: "Started a new conversation with the AI knowledge base."
    });
  };

  const suggestionQuestions = [
    "What are the key concepts in the uploaded documents?",
    "Summarize the main processes described",
    "What definitions are available?",
    "Show me leadership-related content"
  ];

  const handleSuggestionClick = (question: string) => {
    setInput(question);
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>AI Knowledge Assistant</CardTitle>
              <Badge variant="secondary" className="text-xs">
                Learning Enabled
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={startNewConversation}
              disabled={isLoading}
            >
              New Chat
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <Lightbulb className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ask me anything about your documents!</h3>
                  <p className="text-muted-foreground mb-4">
                    I can help you find information, summarize content, and explore concepts from your knowledge base.
                  </p>
                  <div className="grid grid-cols-1 gap-2 max-w-md">
                    {suggestionQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-left justify-start"
                        onClick={() => handleSuggestionClick(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div className={`flex items-start gap-3 ${
                      message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                    }`}>
                      <div className={`p-2 rounded-full ${
                        message.role === 'assistant' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        {message.role === 'assistant' ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      
                      <div className={`flex-1 space-y-2 ${
                        message.role === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                          message.role === 'assistant'
                            ? 'bg-muted text-left'
                            : 'bg-primary text-primary-foreground ml-auto'
                        }`}>
                          <div className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>
                        </div>
                        
                        {message.sources && message.sources.length > 0 && (
                          <div className="space-y-2">
                            <Separator />
                            <div className="text-xs text-muted-foreground">
                              Sources from knowledge base:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {message.sources.map((source) => (
                                <div key={source.id} className="flex items-center gap-1 p-2 bg-background border rounded-md">
                                  <FileText className="h-3 w-3" />
                                  <span className="text-xs font-medium">{source.title}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {source.knowledge_type}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                            {message.sources[0]?.keywords && (
                              <div className="flex flex-wrap gap-1">
                                {message.sources[0].keywords.slice(0, 5).map((keyword) => (
                                  <Badge key={keyword} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={`text-xs text-muted-foreground ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-block p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>

          <Separator />
          
          <form onSubmit={handleSubmit} className="p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your documents..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};