import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Appointment } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatDate, formatTime } from '@/lib/utils';

interface AppointmentsProps {
  appointments: Appointment[];
}

export function Appointments({ appointments }: AppointmentsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const viewAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      const res = await apiRequest('GET', `/api/appointments/${appointmentId}`, null);
      return res.json();
    },
    onError: (error) => {
      toast({
        title: 'Failed to load appointment details',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  function getAppointmentDate(date: Date | string) {
    const appointmentDate = new Date(date);
    return {
      day: appointmentDate.getDate(),
      month: appointmentDate.toLocaleString('default', { month: 'short' }).toUpperCase(),
    };
  }
  
  function getAppointmentDuration(minutes: number) {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-foreground">Upcoming Appointments</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" size="sm" className="text-primary">
                <i className="ri-calendar-add-line mr-1"></i> Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
              </DialogHeader>
              <div className="text-center py-6">
                <p>Please use the Appointments page to schedule a new appointment</p>
                <Button 
                  className="mt-4"
                  onClick={() => {
                    window.location.href = '/appointments';
                  }}
                >
                  Go to Appointments
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {appointments.length === 0 ? (
          <div className="text-center py-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <i className="ri-calendar-line text-primary text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No Appointments</h3>
            <p className="text-sm text-muted-foreground mb-4">You have no upcoming appointments.</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="mx-auto">
                  <i className="ri-calendar-add-line mr-1"></i> Schedule Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Schedule New Appointment</DialogTitle>
                </DialogHeader>
                <div className="text-center py-6">
                  <p>Please use the Appointments page to schedule a new appointment</p>
                  <Button 
                    className="mt-4"
                    onClick={() => {
                      window.location.href = '/appointments';
                    }}
                  >
                    Go to Appointments
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          appointments.map((appointment) => {
            const { day, month } = getAppointmentDate(appointment.date);
            return (
              <div key={appointment.id} className="flex items-start mb-4 last:mb-0">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex flex-col items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-primary font-bold text-lg">{day}</span>
                  <span className="text-primary text-xs">{month}</span>
                </div>
                
                <div className="flex-1 bg-muted rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-foreground">{appointment.type}</h4>
                      <p className="text-sm text-muted-foreground">{appointment.doctorName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {formatTime(appointment.date)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getAppointmentDuration(appointment.duration)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <i className="ri-map-pin-line mr-1"></i>
                      <span>{appointment.location}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="text-primary border-primary">
                        Reschedule
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            onClick={() => viewAppointmentMutation.mutate(appointment.id)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Appointment Details</DialogTitle>
                          </DialogHeader>
                          {viewAppointmentMutation.isPending ? (
                            <div className="py-8 text-center">Loading details...</div>
                          ) : viewAppointmentMutation.isSuccess ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                                  <p className="text-base">{appointment.type}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground">Doctor</h4>
                                  <p className="text-base">{appointment.doctorName}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
                                  <p className="text-base">{formatDate(appointment.date)}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground">Time</h4>
                                  <p className="text-base">{formatTime(appointment.date)}</p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                                <p className="text-base">{appointment.location}</p>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Duration</h4>
                                <p className="text-base">{getAppointmentDuration(appointment.duration)}</p>
                              </div>
                              
                              <div className="flex justify-between pt-4">
                                <Button variant="outline">Cancel Appointment</Button>
                                <Button>Confirm Attendance</Button>
                              </div>
                            </div>
                          ) : (
                            <div className="py-4 text-center text-destructive">
                              Failed to load appointment details
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
