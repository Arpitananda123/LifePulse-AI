import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { getChatResponse } from '@/lib/openai';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { generateUUID } from '@/lib/utils';

interface AiCompanionProps {
  messages: ChatMessage[];
  conversationId?: string;
  onNewMessage?: (message: ChatMessage) => void;
}

export function AiCompanion({ messages = [], conversationId: initialConversationId, onNewMessage }: AiCompanionProps) {
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(initialConversationId || generateUUID());
  const [isAiReady, setIsAiReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Check if AI service is configured and ready
  useEffect(() => {
    const checkAiStatus = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const config = await response.json();
          // We're now using Hugging Face which doesn't require an API key
          setIsAiReady(config.aiStatus === 'active');
        }
      } catch (error) {
        console.error('Failed to check AI status:', error);
        setIsAiReady(false);
      }
    };
    
    checkAiStatus();
  }, []);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      // First store the user message
      const userMessage = {
        content: message,
        sender: 'user',
        conversationId,
        timestamp: new Date().toISOString(), // Convert to ISO string to avoid date serialization issues
      };
      
      // Call API to save the user message
      await apiRequest('POST', '/api/chat/messages', userMessage);
      
      if (onNewMessage) {
        // Create a properly typed message object for the callback
        const tempMessage: ChatMessage = {
          id: Date.now(), // Temporary ID until we get the real one from the server
          userId: 0, // This will be set by the server
          content: userMessage.content,
          sender: userMessage.sender,
          conversationId: userMessage.conversationId,
          timestamp: new Date(), // Use Date object for the local representation
        };
        onNewMessage(tempMessage);
      }
      
      // Prepare conversation history for AI
      const historyMessages = [...messages, userMessage]
        .slice(-10) // Only use the last 10 messages for context
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content,
        }));
      
      // Add system message at the beginning
      const aiMessages = [
        {
          role: 'system',
          content: 'You are HealthPal AI, a friendly health assistant. Your goal is to provide helpful, conversational health advice. Never suggest diagnoses, but you can suggest general wellness tips and encourage users to see healthcare professionals for medical concerns. Be supportive, empathetic, and focus on evidence-based information.'
        },
        ...historyMessages
      ];
      
      // Get response from OpenAI
      const aiResponse = await getChatResponse(aiMessages as any);
      
      // Store AI response
      const aiMessage = {
        content: aiResponse,
        sender: 'ai',
        conversationId,
        timestamp: new Date().toISOString(), // Convert to ISO string to avoid date serialization issues
      };
      
      await apiRequest('POST', '/api/chat/messages', aiMessage);
      
      if (onNewMessage) {
        // Create a properly typed message object for the callback
        const tempAiMessage: ChatMessage = {
          id: Date.now() + 1, // Temporary ID until we get the real one from the server
          userId: 0, // This will be set by the server
          content: aiMessage.content,
          sender: aiMessage.sender,
          conversationId: aiMessage.conversationId,
          timestamp: new Date(), // Use Date object for the local representation
        };
        onNewMessage(tempAiMessage);
      }
      
      return { userMessage, aiMessage };
    },
    onError: (error) => {
      toast({
        title: 'Error sending message',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  });
  
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    sendMessageMutation.mutate(input);
    setInput('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="font-semibold text-lg text-foreground flex items-center">
              HealthPal AI
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full ml-2">No API key needed</span>
            </h2>
            <p className="text-xs text-muted-foreground">Try asking about symptoms, health tips, or wellness advice</p>
          </div>
          <Button variant="link" size="sm" className="text-primary">
            <i className="ri-history-line mr-1"></i> History
          </Button>
        </div>
        
        <div className="bg-muted rounded-lg p-3 h-96 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-3 scrollbar-hide">
            <div className="space-y-3">
              {messages.length === 0 ? (
                // Welcome message
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 flex-shrink-0">
                    <i className="ri-robot-line text-primary"></i>
                  </div>
                  <div className="bg-muted-foreground/10 text-sm p-3 rounded-tl-lg rounded-tr-lg rounded-br-lg max-w-[80%]">
                    {isAiReady ? (
                      <p>Hello! I'm your HealthPal AI assistant powered by Hugging Face. How can I help you today? I can discuss health topics, offer wellness tips, or just chat if you're feeling lonely.</p>
                    ) : (
                      <div>
                        <p className="mb-2">Hello! I'm your HealthPal AI assistant. It looks like my AI capabilities are not fully set up yet.</p>
                        <p className="mb-2">Please check your internet connection or try again later. Our AI service uses Hugging Face's free tier which doesn't require an API key.</p>
                        <p>Once the connection is established, I'll be able to respond to your health questions and provide personalized advice!</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Display chat history
                messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start ${message.sender === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 flex-shrink-0">
                        <i className="ri-robot-line text-primary"></i>
                      </div>
                    )}
                    
                    <div 
                      className={`text-sm p-3 max-w-[80%] ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tl-lg rounded-tr-lg rounded-bl-lg'
                          : 'bg-muted-foreground/10 text-foreground rounded-tl-lg rounded-tr-lg rounded-br-lg'
                      }`}
                    >
                      <p>{message.content}</p>
                    </div>
                    
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-muted overflow-hidden ml-2 flex-shrink-0">
                        <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground">
                          U
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {/* Loading indicator while sending message */}
              {sendMessageMutation.isPending && (
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 flex-shrink-0">
                    <i className="ri-robot-line text-primary"></i>
                  </div>
                  <div className="bg-muted-foreground/10 text-sm p-3 rounded-tl-lg rounded-tr-lg rounded-br-lg">
                    <p className="flex items-center">
                      <span className="mr-2">Thinking</span>
                      <span className="animate-pulse">.</span>
                      <span className="animate-pulse delay-100">.</span>
                      <span className="animate-pulse delay-200">.</span>
                    </p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <div className="relative">
            <Input
              type="text"
              placeholder="Type your message..."
              className="pr-10 rounded-full"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyUp={handleKeyPress}
              disabled={sendMessageMutation.isPending || !isAiReady}
            />
            <Button
              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full p-0"
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending || !input.trim() || !isAiReady}
            >
              <i className="ri-send-plane-fill"></i>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
