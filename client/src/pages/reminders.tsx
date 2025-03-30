import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Reminder, User, insertReminderSchema } from '@shared/schema';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn, formatDate, formatTime } from '@/lib/utils';

export default function Reminders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('all');

  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });

  const { data: reminders, isLoading } = useQuery<Reminder[]>({
    queryKey: ['/api/reminders'],
  });

  const createReminderMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      // Ensure proper date object creation by constructing a valid ISO string
      const dateStr = data.date;
      const timeStr = data.time || '00:00';
      const dateTimeStr = `${dateStr}T${timeStr}`;
      const reminderDate = new Date(dateTimeStr);
      
      const reminderData = {
        userId: user?.id || 1,
        title: data.title,
        description: data.description,
        time: reminderDate.toISOString(), // Convert to ISO string to avoid date serialization issues
        type: data.type,
        icon: getReminderIcon(data.type),
        recurring: data.recurring,
        recurringPattern: data.recurring ? data.recurringPattern : null,
      };
      
      // Log the constructed reminder to verify date handling
      console.log("Creating reminder with date:", reminderDate, "ISO string:", reminderDate.toISOString());
      
      const res = await apiRequest('POST', '/api/reminders', reminderData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
      toast({
        title: 'Reminder created',
        description: 'Your reminder has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create reminder',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  });

  const completeReminderMutation = useMutation({
    mutationFn: async (reminderId: number) => {
      const res = await apiRequest('PATCH', `/api/reminders/${reminderId}/complete`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
      toast({
        title: 'Reminder completed',
        description: 'Your reminder has been marked as completed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to complete reminder',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  });

  const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    date: z.string(),
    time: z.string(),
    type: z.string(),
    recurring: z.boolean().default(false),
    recurringPattern: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      time: "08:00",
      type: "medicine",
      recurring: false,
      recurringPattern: "daily"
    },
  });

  function getReminderIcon(type: string) {
    switch (type) {
      case 'medicine':
        return 'ri-medicine-bottle-line';
      case 'water':
        return 'ri-drop-line';
      case 'activity':
        return 'ri-walk-line';
      case 'appointment':
        return 'ri-calendar-check-line';
      default:
        return 'ri-notification-3-line';
    }
  }

  function onSubmit(data: z.infer<typeof formSchema>) {
    createReminderMutation.mutate(data);
  }

  // Default user data for development
  const defaultUser: Partial<User> = {
    firstName: 'Sarah',
    lastName: 'Johnson',
  };

  // Filter reminders based on selected tab
  const filteredReminders = reminders?.filter(reminder => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'today') {
      const today = new Date().setHours(0, 0, 0, 0);
      const reminderDate = new Date(reminder.time).setHours(0, 0, 0, 0);
      return today === reminderDate;
    }
    if (selectedTab === 'upcoming') {
      const today = new Date().setHours(0, 0, 0, 0);
      const reminderDate = new Date(reminder.time).setHours(0, 0, 0, 0);
      return reminderDate > today;
    }
    if (selectedTab === 'completed') return reminder.completed;
    return true;
  });

  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar user={user || defaultUser} />
      <MobileSidebar user={user || defaultUser} />
      
      <main className="flex-1 overflow-auto pt-0 md:pt-0 mt-16 md:mt-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Reminders</h1>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <i className="ri-add-line mr-2"></i>
                  New Reminder
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Reminder</DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Take medication" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Take 1 tablet with water" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      formatDate(field.value)
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value ? new Date(field.value) : undefined}
                                  onSelect={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a reminder type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="medicine">Medicine</SelectItem>
                              <SelectItem value="water">Water</SelectItem>
                              <SelectItem value="activity">Physical Activity</SelectItem>
                              <SelectItem value="appointment">Appointment</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="recurring"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="w-4 h-4"
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Recurring reminder</FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    {form.watch("recurring") && (
                      <FormField
                        control={form.control}
                        name="recurringPattern"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recurring Pattern</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekdays">Weekdays</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={createReminderMutation.isPending}>
                        {createReminderMutation.isPending ? "Creating..." : "Create Reminder"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedTab}>
              {isLoading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6 h-40"></CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredReminders?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <i className="ri-notification-3-line text-primary text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-medium text-foreground mb-2">No reminders found</h3>
                  <p className="text-muted-foreground mb-6">
                    {selectedTab === 'all' ? "You don't have any reminders yet." : 
                     selectedTab === 'today' ? "You don't have any reminders for today." :
                     selectedTab === 'upcoming' ? "You don't have any upcoming reminders." :
                     "You don't have any completed reminders."}
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <i className="ri-add-line mr-2"></i>
                        Create New Reminder
                      </Button>
                    </DialogTrigger>
                    {/* Dialog content is the same as above */}
                  </Dialog>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredReminders?.map((reminder) => (
                    <Card key={reminder.id} className={cn(reminder.completed && "opacity-60")}>
                      <CardContent className="p-6">
                        <div className="flex items-start mb-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <i className={`${getReminderIcon(reminder.type)} text-primary`}></i>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground">{reminder.title}</h3>
                            {reminder.description && (
                              <p className="text-sm text-muted-foreground">{reminder.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="bg-muted rounded p-2">
                            <p className="text-xs text-muted-foreground">Date</p>
                            <p className="font-medium">{formatDate(reminder.time)}</p>
                          </div>
                          <div className="bg-muted rounded p-2">
                            <p className="text-xs text-muted-foreground">Time</p>
                            <p className="font-medium">{formatTime(reminder.time)}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          {reminder.recurring && reminder.recurringPattern && (
                            <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                              {reminder.recurringPattern.charAt(0).toUpperCase() + reminder.recurringPattern.slice(1)}
                            </span>
                          )}
                          
                          {!reminder.completed ? (
                            <Button 
                              variant="secondary" 
                              size="sm"
                              className="ml-auto"
                              onClick={() => completeReminderMutation.mutate(reminder.id)}
                              disabled={completeReminderMutation.isPending}
                            >
                              Mark Complete
                            </Button>
                          ) : (
                            <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
