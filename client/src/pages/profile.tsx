import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@shared/schema';
import { getInitials } from '@/lib/utils';

export default function Profile() {
  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });
  
  // Default user data for development
  const defaultUser: Partial<User> = {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    username: 'sarahj',
    tokenBalance: 2840,
    lifetimeTokens: 4250,
    streak: 5,
    streakGoal: 7,
  };
  
  const userData = user || defaultUser;
  
  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar user={userData} />
      <MobileSidebar user={userData} />
      
      <main className="flex-1 overflow-auto pt-0 md:pt-0 mt-16 md:mt-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Profile</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardContent className="p-6 flex flex-col items-center">
                  <Avatar className="h-28 w-28 mb-4">
                    <AvatarImage src={userData.profileImage} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(`${userData.firstName} ${userData.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-xl font-semibold text-center">
                    {userData.firstName} {userData.lastName}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    Member since 2023
                  </p>
                  
                  <Button variant="outline" className="w-full mb-2">
                    Change Photo
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-3">
              <Tabs defaultValue="personal">
                <TabsList className="mb-6">
                  <TabsTrigger value="personal">Personal Information</TabsTrigger>
                  <TabsTrigger value="account">Account Settings</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="health">Health Information</TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" defaultValue={userData.firstName} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" defaultValue={userData.lastName} />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" type="email" defaultValue={userData.email} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input id="phone" defaultValue="(555) 123-4567" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input id="address" defaultValue="123 Health Street, Wellness City" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" defaultValue="Wellness City" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input id="state" defaultValue="CA" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zip">ZIP Code</Label>
                            <Input id="zip" defaultValue="12345" />
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button>Save Changes</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="account">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input id="username" defaultValue={userData.username} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input id="current-password" type="password" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input id="confirm-password" type="password" />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button>Update Password</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Medication Reminders</h3>
                            <p className="text-sm text-muted-foreground">
                              Receive reminders to take your medication
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="medication-email" className="text-sm">Email</Label>
                            <input type="checkbox" id="medication-email" defaultChecked className="mr-4" />
                            
                            <Label htmlFor="medication-sms" className="text-sm">SMS</Label>
                            <input type="checkbox" id="medication-sms" defaultChecked />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Appointment Reminders</h3>
                            <p className="text-sm text-muted-foreground">
                              Receive reminders about upcoming appointments
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="appointment-email" className="text-sm">Email</Label>
                            <input type="checkbox" id="appointment-email" defaultChecked className="mr-4" />
                            
                            <Label htmlFor="appointment-sms" className="text-sm">SMS</Label>
                            <input type="checkbox" id="appointment-sms" defaultChecked />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Health Updates</h3>
                            <p className="text-sm text-muted-foreground">
                              Receive updates about your health metrics
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="health-email" className="text-sm">Email</Label>
                            <input type="checkbox" id="health-email" defaultChecked className="mr-4" />
                            
                            <Label htmlFor="health-sms" className="text-sm">SMS</Label>
                            <input type="checkbox" id="health-sms" />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Achievement Notifications</h3>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications when you earn achievements or tokens
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="achievement-email" className="text-sm">Email</Label>
                            <input type="checkbox" id="achievement-email" defaultChecked className="mr-4" />
                            
                            <Label htmlFor="achievement-sms" className="text-sm">SMS</Label>
                            <input type="checkbox" id="achievement-sms" />
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button>Save Preferences</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="health">
                  <Card>
                    <CardHeader>
                      <CardTitle>Health Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="height">Height (cm)</Label>
                            <Input id="height" type="number" defaultValue="165" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input id="weight" type="number" defaultValue="65" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="blood-type">Blood Type</Label>
                          <select 
                            id="blood-type" 
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            defaultValue="O+"
                          >
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="allergies">Allergies</Label>
                          <Input id="allergies" defaultValue="Penicillin, Peanuts" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="medications">Current Medications</Label>
                          <Input id="medications" defaultValue="Aspirin, Lisinopril" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="conditions">Medical Conditions</Label>
                          <Input id="conditions" defaultValue="Hypertension" />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button>Save Health Information</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
