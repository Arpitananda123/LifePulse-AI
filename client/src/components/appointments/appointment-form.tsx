import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AppointmentFormProps {
  initialDate?: Date;
}

export function AppointmentForm({ initialDate }: AppointmentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const formSchema = z.object({
    type: z.string().min(1, "Appointment type is required"),
    doctorName: z.string().min(1, "Doctor name is required"),
    location: z.string().min(1, "Location is required"),
    date: z.date({
      required_error: "Please select a date",
    }),
    time: z.string().min(1, "Please select a time"),
    duration: z.number().min(15, "Duration must be at least 15 minutes"),
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      doctorName: "",
      location: "",
      date: initialDate || new Date(),
      time: "09:00",
      duration: 30,
    },
  });
  
  const createAppointmentMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Combine date and time
      const appointmentDate = new Date(values.date);
      const [hours, minutes] = values.time.split(':').map(Number);
      appointmentDate.setHours(hours, minutes);
      
      const appointmentData = {
        type: values.type,
        doctorName: values.doctorName,
        location: values.location,
        date: appointmentDate.toISOString(),
        duration: values.duration,
        status: 'scheduled',
      };
      
      const res = await apiRequest('POST', '/api/appointments', appointmentData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Appointment scheduled",
        description: "Your appointment has been scheduled successfully.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to schedule appointment",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    createAppointmentMutation.mutate(values);
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Appointment Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Cardiology Follow-up">Cardiology Follow-up</SelectItem>
                  <SelectItem value="Annual Physical">Annual Physical</SelectItem>
                  <SelectItem value="Dermatology Consultation">Dermatology Consultation</SelectItem>
                  <SelectItem value="Dental Check-up">Dental Check-up</SelectItem>
                  <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
                  <SelectItem value="General Consultation">General Consultation</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="doctorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doctor's Name</FormLabel>
                <FormControl>
                  <Input placeholder="Dr. Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Hospital or Clinic Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          "pl-3 text-left font-normal",
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
                      selected={field.value}
                      onSelect={field.onChange}
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
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={createAppointmentMutation.isPending}>
            {createAppointmentMutation.isPending ? "Scheduling..." : "Schedule Appointment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
