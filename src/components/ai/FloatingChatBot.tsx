import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIKnowledgeChat } from './AIKnowledgeChat';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';

export const FloatingChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ offsetX: number; offsetY: number }>({ offsetX: 0, offsetY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = (e.target as HTMLElement).closest('.floating-chat')?.getBoundingClientRect();
    if (rect) {
      dragRef.current = {
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragRef.current.offsetX,
        y: e.clientY - dragRef.current.offsetY,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Floating toggle button
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-50"
        size="sm"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div
      className="floating-chat fixed z-50 select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isMinimized ? '300px' : '400px',
        height: isMinimized ? 'auto' : '600px',
      }}
    >
      <Card className="h-full shadow-2xl border-2">
        <CardHeader 
          className="flex-shrink-0 border-b cursor-move bg-primary text-primary-foreground rounded-t-md"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">AI Course Assistant</CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex-1 p-0 overflow-hidden">
            <div className="h-full">
              <AIKnowledgeChat />
            </div>
          </CardContent>
        )}

        {isMinimized && (
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              Click to expand and chat with the AI assistant
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
};