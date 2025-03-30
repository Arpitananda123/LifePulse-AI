import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { User, ChatMessage } from '@shared/schema';
import { AiCompanion } from '@/components/dashboard/ai-companion';
import { generateUUID } from '@/lib/utils';

export default function AiCompanionPage() {
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });
  
  const { data: allConversations } = useQuery<{id: string, title: string}[]>({
    queryKey: ['/api/chat/conversations'],
  });
  
  const { data: conversationMessages, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/messages', activeConversation],
    enabled: !!activeConversation,
  });
  
  // Update messages when conversation changes
  useEffect(() => {
    if (conversationMessages) {
      setMessages(conversationMessages);
    } else {
      setMessages([]);
    }
  }, [conversationMessages]);
  
  // Initialize conversations from the API response
  useEffect(() => {
    if (allConversations && allConversations.length > 0) {
      const conversationsMap: Record<string, string> = {};
      allConversations.forEach(conv => {
        conversationsMap[conv.id] = conv.title;
      });
      setConversations(conversationsMap);
      
      // If no active conversation is set, set the first one
      if (!activeConversation) {
        setActiveConversation(allConversations[0].id);
      }
    }
  }, [allConversations, activeConversation]);
  
  const handleStartNewConversation = () => {
    const newConversationId = generateUUID();
    const newTitle = "New Conversation";
    
    setConversations({
      ...conversations,
      [newConversationId]: newTitle
    });
    
    setActiveConversation(newConversationId);
    setMessages([]);
  };
  
  const handleNewMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };
  
  // Default user data for development
  const defaultUser: Partial<User> = {
    firstName: 'Sarah',
    lastName: 'Johnson',
  };

  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar user={user || defaultUser} />
      <MobileSidebar user={user || defaultUser} />
      
      <main className="flex-1 overflow-auto pt-0 md:pt-0 mt-16 md:mt-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">AI Companion</h1>
            <Button onClick={handleStartNewConversation}>
              <i className="ri-add-line mr-2"></i>
              New Conversation
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Conversations List - For larger screens */}
            <Card className="hidden lg:block">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg text-foreground">Conversations</h2>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={handleStartNewConversation}
                  >
                    <i className="ri-add-line mr-2"></i>
                    New Conversation
                  </Button>
                  
                  {Object.entries(conversations).map(([id, title]) => (
                    <Button
                      key={id}
                      variant={activeConversation === id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveConversation(id)}
                    >
                      <i className="ri-message-3-line mr-2"></i>
                      {title}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Conversations Tabs - For mobile screens */}
            <div className="lg:hidden mb-4">
              <Tabs value={activeConversation || "new"} onValueChange={(value) => {
                if (value === "new") {
                  handleStartNewConversation();
                } else {
                  setActiveConversation(value);
                }
              }}>
                <TabsList className="w-full overflow-x-auto">
                  <TabsTrigger value="new">
                    <i className="ri-add-line mr-1"></i> New
                  </TabsTrigger>
                  {Object.entries(conversations).map(([id, title]) => (
                    <TabsTrigger key={id} value={id}>
                      {title.length > 10 ? `${title.substring(0, 10)}...` : title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            
            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              <Card className="h-[calc(100vh-200px)]">
                <CardContent className="p-0 h-full">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : activeConversation ? (
                    <AiCompanion
                      messages={messages}
                      conversationId={activeConversation}
                      onNewMessage={handleNewMessage}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <i className="ri-robot-line text-primary text-3xl"></i>
                      </div>
                      <h3 className="text-xl font-medium text-foreground mb-2">Welcome to HealthPal AI</h3>
                      <p className="text-center text-muted-foreground mb-6 max-w-md">
                        Your personal health assistant ready to answer questions, provide wellness tips, and keep you company.
                      </p>
                      <Button onClick={handleStartNewConversation}>
                        Start a Conversation
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
