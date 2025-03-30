import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Achievement, Reward } from '@shared/schema';
import { Rewards as RewardsComponent } from '@/components/dashboard/rewards';
import { formatNumber, formatDate } from '@/lib/utils';

export default function Rewards() {
  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });
  
  const { data: achievements, isLoading: isAchievementsLoading } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
  });
  
  const { data: rewards, isLoading: isRewardsLoading } = useQuery<Reward[]>({
    queryKey: ['/api/rewards'],
  });
  
  // Default user data for development
  const defaultUser: Partial<User> = {
    firstName: 'Sarah',
    lastName: 'Johnson',
    tokenBalance: 2840,
    lifetimeTokens: 4250,
    streak: 5,
    streakGoal: 7,
  };
  
  // Group achievements by category
  const achievementCategories = {
    health: 'Health Tracking',
    activity: 'Physical Activity',
    hydration: 'Hydration',
    medicine: 'Medication',
    sleep: 'Sleep'
  };

  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar user={user || defaultUser} />
      <MobileSidebar user={user || defaultUser} />
      
      <main className="flex-1 overflow-auto pt-0 md:pt-0 mt-16 md:mt-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Rewards & Tokens</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="col-span-1">
              <RewardsComponent user={user || defaultUser} achievements={achievements || []} />
            </div>
            
            <div className="md:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>How to Earn Tokens</CardTitle>
                  <CardDescription>
                    Complete daily health activities to earn tokens that can be redeemed for rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <i className="ri-drop-line text-primary text-xl"></i>
                        </div>
                        <div>
                          <h3 className="font-medium">Track Hydration</h3>
                          <p className="text-sm text-muted-foreground">10 tokens per day</p>
                        </div>
                      </div>
                      <p className="text-sm">Log your daily water intake to earn tokens and maintain optimal hydration.</p>
                    </div>
                    
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <i className="ri-medicine-bottle-line text-primary text-xl"></i>
                        </div>
                        <div>
                          <h3 className="font-medium">Take Medications</h3>
                          <p className="text-sm text-muted-foreground">15 tokens per day</p>
                        </div>
                      </div>
                      <p className="text-sm">Mark your medication reminders as complete to earn tokens.</p>
                    </div>
                    
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <i className="ri-walk-line text-primary text-xl"></i>
                        </div>
                        <div>
                          <h3 className="font-medium">Daily Steps</h3>
                          <p className="text-sm text-muted-foreground">5 tokens per 1,000 steps</p>
                        </div>
                      </div>
                      <p className="text-sm">Track your steps to earn tokens and stay active.</p>
                    </div>
                    
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <i className="ri-heart-pulse-line text-primary text-xl"></i>
                        </div>
                        <div>
                          <h3 className="font-medium">Log Vitals</h3>
                          <p className="text-sm text-muted-foreground">20 tokens per day</p>
                        </div>
                      </div>
                      <p className="text-sm">Track your blood pressure, heart rate, and other vital signs to earn tokens.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Redeem Tokens</CardTitle>
                  <CardDescription>
                    Use your earned tokens to unlock rewards and discounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">Health Checkup Discount</h3>
                            <p className="text-sm text-muted-foreground">Get 10% off your next health checkup</p>
                          </div>
                          <div className="text-xl font-bold">500</div>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          disabled={(user?.tokenBalance || defaultUser.tokenBalance || 0) < 500}
                        >
                          Redeem Reward
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">Prescription Discount</h3>
                            <p className="text-sm text-muted-foreground">Get 15% off your next prescription</p>
                          </div>
                          <div className="text-xl font-bold">1,000</div>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          disabled={(user?.tokenBalance || defaultUser.tokenBalance || 0) < 1000}
                        >
                          Redeem Reward
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">Wellness Product</h3>
                            <p className="text-sm text-muted-foreground">$25 credit for wellness products</p>
                          </div>
                          <div className="text-xl font-bold">2,500</div>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          disabled={(user?.tokenBalance || defaultUser.tokenBalance || 0) < 2500}
                        >
                          Redeem Reward
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">Premium Consultation</h3>
                            <p className="text-sm text-muted-foreground">Free specialist consultation</p>
                          </div>
                          <div className="text-xl font-bold">5,000</div>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          disabled={(user?.tokenBalance || defaultUser.tokenBalance || 0) < 5000}
                        >
                          Redeem Reward
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Tabs defaultValue="achievements">
            <TabsList className="mb-6">
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="history">Token History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="achievements">
              {isAchievementsLoading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : !achievements || achievements.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <i className="ri-award-line text-primary text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-medium text-foreground mb-2">No achievements yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Complete daily health activities to earn achievements and unlock rewards.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                            <i className={`${achievement.icon || 'ri-award-line'} text-primary text-xl`}></i>
                          </div>
                          <div>
                            <h3 className="font-medium">{achievement.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              Earned on {formatDate(achievement.acquiredAt)}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history">
              {isRewardsLoading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : !rewards || rewards.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <i className="ri-coin-line text-primary text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-medium text-foreground mb-2">No token history yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Complete daily health activities to earn tokens and build your history.
                  </p>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <div className="relative overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted">
                          <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Activity</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3 text-right">Tokens</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rewards.map((reward) => (
                            <tr key={reward.id} className="border-b">
                              <td className="px-6 py-4">{formatDate(reward.acquiredAt)}</td>
                              <td className="px-6 py-4">{reward.name}</td>
                              <td className="px-6 py-4 capitalize">{reward.type}</td>
                              <td className="px-6 py-4 text-right font-mono font-medium">
                                {reward.type === 'token' ? '+10' : reward.type === 'badge' ? '+50' : '+100'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
