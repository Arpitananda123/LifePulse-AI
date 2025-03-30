import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { HealthOverview } from '@/components/dashboard/health-overview';
import { HealthTrends } from '@/components/dashboard/health-trends';
import { Reminders } from '@/components/dashboard/reminders';
import { Appointments } from '@/components/dashboard/appointments';
import { AiCompanion } from '@/components/dashboard/ai-companion';
import { Rewards } from '@/components/dashboard/rewards';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { User, HealthStats, Reminder, Appointment, ChatMessage, Achievement } from '@shared/schema';

export default function Dashboard() {
  const { data: user, isLoading: isUserLoading } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });

  const { data: healthStats, isLoading: isHealthStatsLoading } = useQuery<HealthStats>({
    queryKey: ['/api/health-stats/latest'],
  });

  const { data: reminders, isLoading: isRemindersLoading } = useQuery<Reminder[]>({
    queryKey: ['/api/reminders'],
  });

  const { data: appointments, isLoading: isAppointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
  });

  const { data: chatMessages, isLoading: isChatMessagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/messages/recent'],
  });

  const { data: achievements, isLoading: isAchievementsLoading } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
  });

  // Sample health trends data
  const healthTrendsData = {
    heartRate: [
      { time: '12am', value: 62 },
      { time: '3am', value: 58 },
      { time: '6am', value: 65 },
      { time: '9am', value: 72 },
      { time: '12pm', value: 78 },
      { time: '3pm', value: 74 },
      { time: '6pm', value: 76 },
      { time: '9pm', value: 70 },
    ],
    bloodPressure: [
      { time: '12am', systolic: 115, diastolic: 75 },
      { time: '3am', systolic: 110, diastolic: 70 },
      { time: '6am', systolic: 118, diastolic: 77 },
      { time: '9am', systolic: 122, diastolic: 80 },
      { time: '12pm', systolic: 125, diastolic: 82 },
      { time: '3pm', systolic: 120, diastolic: 80 },
      { time: '6pm', systolic: 118, diastolic: 78 },
      { time: '9pm', systolic: 116, diastolic: 76 },
    ],
  };

  // Default user data for development
  const defaultUser: Partial<User> = {
    firstName: 'Sarah',
    lastName: 'Johnson',
    tokenBalance: 2840,
    lifetimeTokens: 4250,
    streak: 5,
    streakGoal: 7,
  };

  // We'll use either the loaded data or default values while loading
  const userData = isUserLoading ? defaultUser : user || defaultUser;

  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar user={userData} />
      <MobileSidebar user={userData} />
      
      <main className="flex-1 overflow-auto pt-0 md:pt-0 mt-16 md:mt-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Dashboard Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Hello, <span className="text-primary">{userData.firstName}</span>!
            </h1>
            <p className="text-muted-foreground">Here's a quick overview of your health today.</p>
          </div>
          
          {/* Health Overview Cards */}
          <HealthOverview healthStats={isHealthStatsLoading ? {} : healthStats || {}} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Health Trends Chart */}
              <HealthTrends data={healthTrendsData} />
              
              {/* Reminders Section */}
              <Reminders reminders={isRemindersLoading ? [] : reminders || []} />
              
              {/* Appointments Section */}
              <Appointments appointments={isAppointmentsLoading ? [] : appointments || []} />
            </div>
            
            <div className="lg:col-span-1">
              {/* AI Companion Section */}
              <AiCompanion messages={isChatMessagesLoading ? [] : chatMessages || []} />
              
              {/* Rewards Section */}
              <Rewards 
                user={userData} 
                achievements={isAchievementsLoading ? [] : achievements || []} 
              />
              
              {/* Quick Actions */}
              <QuickActions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
