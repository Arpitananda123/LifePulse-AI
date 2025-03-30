import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface VitalFormProps {
  initialType?: string;
}

export function VitalForm({ initialType = 'bloodPressure' }: VitalFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const formSchema = z.object({
    type: z.string().min(1, "Type is required"),
    value: z.string().min(1, "Value is required"),
    notes: z.string().optional(),
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: initialType,
      value: "",
      notes: "",
    },
  });
  
  const logVitalMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const vitalData = {
        type: values.type,
        value: values.value,
        notes: values.notes || "",
      };
      
      const res = await apiRequest('POST', '/api/health-tracking', vitalData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/health-tracking'] });
      queryClient.invalidateQueries({ queryKey: ['/api/health-stats/latest'] });
      toast({
        title: "Health data logged",
        description: "Your health data has been recorded successfully.",
      });
      form.reset({ 
        type: form.getValues('type'), 
        value: "", 
        notes: "" 
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to log health data",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    logVitalMutation.mutate(values);
  }
  
  // Get placeholder and label text based on selected type
  const getTypeInfo = () => {
    switch (form.watch('type')) {
      case 'bloodPressure':
        return { 
          placeholder: 'e.g., 120/80', 
          label: 'Blood Pressure (mmHg)',
          description: 'Enter in systolic/diastolic format (e.g., 120/80)'
        };
      case 'heartRate':
        return { 
          placeholder: 'e.g., 72', 
          label: 'Heart Rate (bpm)',
          description: 'Enter your heart rate in beats per minute'
        };
      case 'steps':
        return { 
          placeholder: 'e.g., 8000', 
          label: 'Steps',
          description: 'Enter your step count for the day'
        };
      case 'hydration':
        return { 
          placeholder: 'e.g., 6', 
          label: 'Hydration (glasses)',
          description: 'Enter the number of water glasses consumed'
        };
      case 'weight':
        return { 
          placeholder: 'e.g., 70.5', 
          label: 'Weight (kg)',
          description: 'Enter your weight in kilograms'
        };
      case 'sleep':
        return { 
          placeholder: 'e.g., 7.5', 
          label: 'Sleep (hours)',
          description: 'Enter your sleep duration in hours'
        };
      default:
        return { 
          placeholder: 'Enter value', 
          label: 'Value',
          description: 'Enter the measurement value'
        };
    }
  };
  
  const typeInfo = getTypeInfo();
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Measurement Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a measurement type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bloodPressure">Blood Pressure</SelectItem>
                  <SelectItem value="heartRate">Heart Rate</SelectItem>
                  <SelectItem value="steps">Steps</SelectItem>
                  <SelectItem value="hydration">Hydration</SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="sleep">Sleep</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{typeInfo.label}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={typeInfo.placeholder} 
                  {...field} 
                  type={form.watch('type') === 'bloodPressure' ? 'text' : 'number'}
                  step={form.watch('type') === 'weight' || form.watch('type') === 'sleep' ? '0.1' : '1'}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">{typeInfo.description}</p>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add any additional notes or context about this measurement" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={logVitalMutation.isPending}>
            {logVitalMutation.isPending ? "Saving..." : "Log Health Data"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
