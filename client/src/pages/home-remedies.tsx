import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HomeRemedy, User } from '@shared/schema';
import { RemedyCard } from '@/components/home-remedies/remedy-card';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { suggestHomeRemedies } from '@/lib/openai';

export default function HomeRemedies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });
  
  const { data: remedies, isLoading } = useQuery<HomeRemedy[]>({
    queryKey: ['/api/home-remedies'],
  });
  
  const aiSuggestionMutation = useMutation({
    mutationFn: async (ailment: string) => {
      return suggestHomeRemedies(ailment);
    },
    onSuccess: (data) => {
      if (data.remedies.length === 0) {
        toast({
          title: "No remedies found",
          description: "We couldn't find any remedies for this ailment. Please try another search term.",
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error getting suggestions",
        description: error instanceof Error ? error.message : "Failed to get remedy suggestions",
        variant: "destructive"
      });
    }
  });
  
  const handleSearch = () => {
    setSearchQuery(searchTerm);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Get unique ailment categories
  // Get unique ailment categories
  const categories = ['all'];
  if (remedies) {
    // Use a regular object to track unique values instead of Set
    const uniqueAilments: Record<string, boolean> = {};
    remedies.forEach(remedy => {
      if (!uniqueAilments[remedy.ailment]) {
        uniqueAilments[remedy.ailment] = true;
        categories.push(remedy.ailment);
      }
    });
  }
  
  // Filter remedies based on search and category
  const filteredRemedies = remedies?.filter(remedy => {
    const matchesSearch = !searchQuery || 
      remedy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      remedy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      remedy.ailment.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || remedy.ailment === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Default user data for development
  const defaultUser: Partial<User> = {
    firstName: 'Sarah',
    lastName: 'Johnson',
  };
  
  // Check if we're showing AI suggestions
  const isShowingAiSuggestions = searchQuery && aiSuggestionMutation.isSuccess && aiSuggestionMutation.data.remedies.length > 0;

  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar user={user || defaultUser} />
      <MobileSidebar user={user || defaultUser} />
      
      <main className="flex-1 overflow-auto pt-0 md:pt-0 mt-16 md:mt-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Home Remedies</h1>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for a remedy or ailment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="sm:w-64 pr-10"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={handleSearch}
                >
                  <i className="ri-search-line"></i>
                </Button>
              </div>
              
              <Button 
                onClick={() => {
                  if (searchTerm) {
                    setSearchQuery(searchTerm);
                    aiSuggestionMutation.mutate(searchTerm);
                  }
                }}
                disabled={!searchTerm || aiSuggestionMutation.isPending}
              >
                {aiSuggestionMutation.isPending ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-1"></i>
                    Searching...
                  </>
                ) : (
                  <>
                    <i className="ri-ai-generate mr-1"></i>
                    Get AI Suggestions
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Categories Tabs */}
          <Tabs 
            defaultValue="all" 
            value={selectedCategory} 
            onValueChange={setSelectedCategory}
            className="mb-6"
          >
            <TabsList className="mb-4 flex flex-wrap h-auto">
              {categories.map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="capitalize"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          {/* AI Suggestions Section */}
          {isShowingAiSuggestions && (
            <div className="mb-8">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    <span className="flex items-center">
                      <i className="ri-ai-generate mr-2 text-primary"></i>
                      AI Suggested Remedies via Hugging Face
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full ml-2">No API key needed</span>
                    </span>
                    <span className="block text-sm text-muted-foreground mt-1">Search term: "{searchQuery}"</span>
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {aiSuggestionMutation.data.remedies.map((remedy, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-4">
                          <h3 className="font-medium text-lg mb-2">{remedy.title}</h3>
                          
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Ingredients:</h4>
                            <ul className="text-sm list-disc pl-5">
                              {remedy.ingredients.map((ingredient, i) => (
                                <li key={i}>{ingredient}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Instructions:</h4>
                            <p className="text-sm">{remedy.instructions}</p>
                          </div>
                          
                          <div className="flex items-center mt-2">
                            <span className="text-sm font-medium mr-2">Effectiveness:</span>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <i 
                                  key={i}
                                  className={`ri-star-fill text-sm ${
                                    i < remedy.effectiveness ? 'text-amber-500' : 'text-muted'
                                  }`}
                                ></i>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Remedies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <CardContent className="p-0">
                    <div className="h-40 bg-muted"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 w-2/3 bg-muted rounded"></div>
                      <div className="h-3 w-full bg-muted rounded"></div>
                      <div className="h-3 w-full bg-muted rounded"></div>
                      <div className="h-3 w-4/5 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredRemedies && filteredRemedies.length > 0 ? (
              filteredRemedies.map(remedy => (
                <RemedyCard key={remedy.id} remedy={remedy} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <i className="ri-medicine-bottle-line text-primary text-2xl"></i>
                </div>
                <h3 className="text-xl font-medium text-foreground mb-2">No remedies found</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  {searchQuery 
                    ? `We couldn't find any remedies matching "${searchQuery}". Try a different search term.` 
                    : "There are no remedies available in this category yet."}
                </p>
                {searchQuery && (
                  <Button
                    onClick={() => {
                      aiSuggestionMutation.mutate(searchQuery);
                    }}
                    disabled={aiSuggestionMutation.isPending}
                  >
                    {aiSuggestionMutation.isPending ? (
                      <>
                        <i className="ri-loader-4-line animate-spin mr-1"></i>
                        Searching...
                      </>
                    ) : (
                      <>
                        <i className="ri-ai-generate mr-1"></i>
                        Get AI Suggestions
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
