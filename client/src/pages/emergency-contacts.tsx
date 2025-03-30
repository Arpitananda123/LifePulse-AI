import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@shared/schema';
import { Phone, MapPin, Mail, Plus, Edit, Trash2 } from 'lucide-react';

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Dr. Michael Chen', relationship: 'Primary Physician', phone: '(555) 123-4567', address: 'Valley Medical Center, 123 Health Ave.' },
    { id: 2, name: 'Sarah Williams', relationship: 'Family', phone: '(555) 987-6543', address: '456 Family Road' },
    { id: 3, name: 'Valley Medical Center', relationship: 'Hospital', phone: '(555) 789-0123', address: '123 Health Avenue' },
  ]);
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });
  
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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Emergency Contacts</h1>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Emergency Contact</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Contact Name</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input id="relationship" placeholder="e.g., Doctor, Family, Hospital" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="(123) 456-7890" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="123 Street, City, State" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>Add Contact</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="mb-8">
            <Card className="bg-destructive text-destructive-foreground">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="mb-4 md:mb-0">
                    <h2 className="text-xl font-bold mb-2">Emergency Services</h2>
                    <p>In case of medical emergency, call the emergency services immediately.</p>
                  </div>
                  <Button variant="outline" className="border-white text-white hover:bg-white/20">
                    Call 911
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact) => (
              <Card key={contact.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">{contact.name}</h3>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mb-2 text-sm text-muted-foreground">
                    {contact.relationship}
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-primary" />
                      <span>{contact.phone}</span>
                    </div>
                    
                    <div className="flex items-start text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
                      <span>{contact.address}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-border flex justify-between">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
