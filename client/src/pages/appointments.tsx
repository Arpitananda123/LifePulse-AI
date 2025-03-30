import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Appointment, User } from '@shared/schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Appointments as AppointmentsList } from '@/components/dashboard/appointments';
import { AppointmentForm } from '@/components/appointments/appointment-form';
import { formatDate } from '@/lib/utils';

export default function Appointments() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedView, setSelectedView] = useState('calendar');
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });
  
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
  });
  
  // Filter appointments for the selected date
  const filteredAppointments = appointments?.filter(appointment => {
    if (!date) return false;
    const appointmentDate = new Date(appointment.date);
    return (
      appointmentDate.getDate() === date.getDate() &&
      appointmentDate.getMonth() === date.getMonth() &&
      appointmentDate.getFullYear() === date.getFullYear()
    );
  });
  
  // Group appointments by date for the list view
  const appointmentsByDate = appointments?.reduce<Record<string, Appointment[]>>((acc, appointment) => {
    const dateStr = new Date(appointment.date).toISOString().split('T')[0];
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(appointment);
    return acc;
  }, {});
  
  // Default user data for development
  const defaultUser: Partial<User> = {
    firstName: 'Sarah',
    lastName: 'Johnson',
  };
  
  // Create an array of dates that have appointments for highlighting in the calendar
  const datesWithAppointments = appointments?.map(appointment => 
    new Date(appointment.date)
  );

  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar user={user || defaultUser} />
      <MobileSidebar user={user || defaultUser} />
      
      <main className="flex-1 overflow-auto pt-0 md:pt-0 mt-16 md:mt-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Appointments</h1>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <i className="ri-calendar-add-line mr-2"></i>
                  Schedule Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Schedule New Appointment</DialogTitle>
                </DialogHeader>
                <AppointmentForm initialDate={date} />
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <Card>
                <CardContent className="p-4">
                  <Tabs value={selectedView} onValueChange={setSelectedView} className="mb-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="calendar">Calendar</TabsTrigger>
                      <TabsTrigger value="list">List View</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="calendar" className="mt-4">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                        modifiers={{
                          appointment: datesWithAppointments || [],
                        }}
                        modifiersStyles={{
                          appointment: {
                            backgroundColor: 'hsl(var(--primary) / 0.1)',
                            color: 'hsl(var(--primary))',
                            fontWeight: 'bold'
                          }
                        }}
                      />
                    </TabsContent>
                    
                    <TabsContent value="list" className="mt-4">
                      <div className="space-y-1 max-h-[300px] overflow-y-auto">
                        {isLoading ? (
                          <div className="py-8 text-center">Loading...</div>
                        ) : !appointmentsByDate || Object.keys(appointmentsByDate).length === 0 ? (
                          <div className="py-8 text-center">
                            <p className="text-muted-foreground">No appointments found</p>
                          </div>
                        ) : (
                          Object.entries(appointmentsByDate)
                            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                            .map(([dateStr, dateAppointments]) => (
                              <div key={dateStr} className="mb-3">
                                <div className="font-medium text-sm mb-1">
                                  {formatDate(dateStr)}
                                </div>
                                {dateAppointments.map(appointment => (
                                  <Button
                                    key={appointment.id}
                                    variant="ghost"
                                    className="w-full justify-start text-left mb-1 h-auto py-2"
                                    onClick={() => {
                                      setDate(new Date(appointment.date));
                                      setSelectedView('calendar');
                                    }}
                                  >
                                    <div>
                                      <div className="font-medium">{appointment.type}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {appointment.doctorName} • {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                    </div>
                                  </Button>
                                ))}
                              </div>
                            ))
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:w-2/3">
              <Card>
                <CardContent className="p-4">
                  <h2 className="font-semibold text-lg text-foreground mb-4">
                    {date ? (
                      <>Appointments for {formatDate(date)}</>
                    ) : (
                      <>Select a date to view appointments</>
                    )}
                  </h2>
                  
                  {date && (
                    isLoading ? (
                      <div className="py-8 text-center">Loading appointments...</div>
                    ) : filteredAppointments && filteredAppointments.length > 0 ? (
                      <AppointmentsList appointments={filteredAppointments} />
                    ) : (
                      <div className="text-center py-8">
                        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <i className="ri-calendar-line text-primary text-xl"></i>
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-1">No Appointments</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          You have no appointments scheduled for this date.
                        </p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <i className="ri-calendar-add-line mr-2"></i>
                              Schedule Appointment
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Schedule New Appointment</DialogTitle>
                            </DialogHeader>
                            <AppointmentForm initialDate={date} />
                          </DialogContent>
                        </Dialog>
                      </div>
                    )
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
