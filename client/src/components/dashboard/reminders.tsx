import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reminder } from '@shared/schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface RemindersProps {
  reminders: Reminder[];
}

export function Reminders({ reminders }: RemindersProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  
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
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const snoozeReminderMutation = useMutation({
    mutationFn: async ({ reminderId, minutes }: { reminderId: number; minutes: number }) => {
      const res = await apiRequest('PATCH', `/api/reminders/${reminderId}/snooze`, { minutes });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
      toast({
        title: 'Reminder snoozed',
        description: 'Your reminder has been snoozed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to snooze reminder',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'medicine':
        return 'ri-medicine-bottle-line';
      case 'water':
        return 'ri-drop-line';
      case 'activity':
        return 'ri-walk-line';
      default:
        return 'ri-notification-3-line';
    }
  };
  
  const handleSnooze = (reminder: Reminder, minutes: number) => {
    snoozeReminderMutation.mutate({ reminderId: reminder.id, minutes });
    setSelectedReminder(null);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-foreground">Today's Reminders</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" size="sm" className="text-primary">
                <i className="ri-add-line mr-1"></i> Add New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Reminder</DialogTitle>
              </DialogHeader>
              {/* We'll display the reminder form component when we integrate it */}
              <div className="text-center py-6">
                <p>Please use the Reminders page to create a new reminder</p>
                <Button 
                  className="mt-4"
                  onClick={() => {
                    window.location.href = '/reminders';
                  }}
                >
                  Go to Reminders
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {reminders.length === 0 ? (
          <div className="text-center py-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <i className="ri-notification-3-line text-primary text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No Reminders</h3>
            <p className="text-sm text-muted-foreground mb-4">You have no reminders for today.</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="mx-auto">
                  <i className="ri-add-line mr-1"></i> Create Reminder
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Reminder</DialogTitle>
                </DialogHeader>
                {/* We'll display the reminder form component when we integrate it */}
                <div className="text-center py-6">
                  <p>Please use the Reminders page to create a new reminder</p>
                  <Button 
                    className="mt-4"
                    onClick={() => {
                      window.location.href = '/reminders';
                    }}
                  >
                    Go to Reminders
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div key={reminder.id} className="mb-3 border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <i className={`${getReminderIcon(reminder.type)} text-primary`}></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{reminder.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(reminder.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {reminder.description && ` • ${reminder.description}`}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className={cn(reminder.completed && "bg-muted text-muted-foreground")}
                    disabled={reminder.completed || completeReminderMutation.isPending}
                    onClick={() => completeReminderMutation.mutate(reminder.id)}
                  >
                    {reminder.completed ? 'Completed' : 'Mark Done'}
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={reminder.completed || snoozeReminderMutation.isPending}
                        onClick={() => setSelectedReminder(reminder)}
                      >
                        Snooze
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Snooze Reminder</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <p className="text-sm text-muted-foreground">
                          For how long would you like to snooze "{selectedReminder?.title}"?
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          <Button onClick={() => handleSnooze(selectedReminder!, 15)}>15 minutes</Button>
                          <Button onClick={() => handleSnooze(selectedReminder!, 30)}>30 minutes</Button>
                          <Button onClick={() => handleSnooze(selectedReminder!, 60)}>1 hour</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
