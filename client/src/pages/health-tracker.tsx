import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HealthStats, HealthTracking, User } from '@shared/schema';
import { CustomLineChart, CustomBarChart } from '@/components/ui/custom-chart';
import { VitalForm } from '@/components/health-tracker/vital-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HealthOverview } from '@/components/dashboard/health-overview';
import { formatDate, formatTime, ensureDate } from '@/lib/utils';
import dummyHealthData, { 
  generateBloodPressureData,
  generateHeartRateData,
  generateStepCountData,
  generateWeightData,
  generateSleepData
} from '@/lib/dummy-health-data';

export default function HealthTracker() {
  const [selectedMetric, setSelectedMetric] = useState('bloodPressure');
  const [timeRange, setTimeRange] = useState('week');
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });
  
  const { data: healthStats } = useQuery<HealthStats>({
    queryKey: ['/api/health-stats/latest'],
  });
  
  const { data: healthTrackingData, isLoading } = useQuery<HealthTracking[]>({
    queryKey: ['/api/health-tracking', { metric: selectedMetric, timeRange }],
  });
  
  // Generate dummy data for demo purposes
  const [dummyData, setDummyData] = useState<any[]>([]);
  
  useEffect(() => {
    // Generate appropriate dummy data based on selected metric and time range
    let data: any[] = [];
    const days = timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30;
    
    switch (selectedMetric) {
      case 'bloodPressure':
        data = generateBloodPressureData(days).map((item, idx) => ({
          id: idx + 1,
          timestamp: item.timestamp,
          systolic: item.systolic,
          diastolic: item.diastolic,
          value: `${item.systolic}/${item.diastolic}`,
          type: 'bloodPressure',
          name: formatDate(item.timestamp),
          notes: 'Normal reading'
        }));
        break;
      case 'heartRate':
        data = generateHeartRateData(days).map((item, idx) => ({
          id: idx + 1,
          timestamp: item.timestamp,
          value: item.value,
          type: 'heartRate',
          name: formatDate(item.timestamp),
          notes: item.value > 90 ? 'After exercise' : 'Resting'
        }));
        break;
      case 'steps':
        data = generateStepCountData(days).map((item, idx) => ({
          id: idx + 1,
          timestamp: new Date(item.date).toISOString(),
          value: item.value,
          type: 'steps',
          name: formatDate(item.date),
          notes: item.value > 10000 ? 'Active day' : 'Regular day'
        }));
        break;
      case 'weight':
        data = generateWeightData(days).map((item, idx) => ({
          id: idx + 1,
          timestamp: new Date(item.date).toISOString(),
          value: item.value,
          type: 'weight',
          name: formatDate(item.date),
          notes: 'Morning weight'
        }));
        break;
      case 'sleep':
        data = generateSleepData(days).map((item, idx) => ({
          id: idx + 1,
          timestamp: new Date(item.date).toISOString(),
          value: item.hoursSlept,
          type: 'sleep',
          name: formatDate(item.date),
          notes: item.hoursSlept >= 8 ? 'Well rested' : 'Need more sleep'
        }));
        break;
      case 'hydration':
        // Generate random hydration data
        data = generateStepCountData(days).map((item, idx) => ({
          id: idx + 1,
          timestamp: new Date(item.date).toISOString(),
          value: Math.floor(Math.random() * 8) + 3, // Random 3-10 glasses
          type: 'hydration',
          name: formatDate(item.date),
          notes: 'Daily intake'
        }));
        break;
    }
    
    setDummyData(data);
  }, [selectedMetric, timeRange]);
  
  // Format health tracking data for charts - Use dummy data instead of API data for demo
  const chartData = React.useMemo(() => {
    // Using our dummy data instead of real API data
    if (!dummyData || dummyData.length === 0) return [];
    
    return dummyData.map(entry => {
      const date = new Date(entry.timestamp);
      
      // Format time label based on selected time range
      let timeLabel;
      if (timeRange === 'day') {
        timeLabel = formatTime(date);
      } else if (timeRange === 'week') {
        timeLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        timeLabel = formatDate(date).split(',')[0]; // Just get the day/month
      }
      
      // For blood pressure, we already have systolic and diastolic from the dummy data
      if (selectedMetric === 'bloodPressure') {
        return {
          name: timeLabel,
          systolic: entry.systolic || 0,
          diastolic: entry.diastolic || 0,
        };
      }
      
      return {
        name: timeLabel,
        value: parseFloat(entry.value) || 0,
      };
    });
  }, [dummyData, selectedMetric, timeRange]);
  
  // Default user data for development
  const defaultUser: Partial<User> = {
    firstName: 'Sarah',
    lastName: 'Johnson',
  };
  
  // Get the title and unit for the selected metric
  const getMetricInfo = () => {
    switch (selectedMetric) {
      case 'bloodPressure':
        return { title: 'Blood Pressure', unit: 'mmHg' };
      case 'heartRate':
        return { title: 'Heart Rate', unit: 'bpm' };
      case 'steps':
        return { title: 'Steps', unit: 'steps' };
      case 'hydration':
        return { title: 'Hydration', unit: 'glasses' };
      case 'weight':
        return { title: 'Weight', unit: 'kg' };
      case 'sleep':
        return { title: 'Sleep', unit: 'hours' };
      default:
        return { title: selectedMetric, unit: '' };
    }
  };
  
  const metricInfo = getMetricInfo();

  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar user={user || defaultUser} />
      <MobileSidebar user={user || defaultUser} />
      
      <main className="flex-1 overflow-auto pt-0 md:pt-0 mt-16 md:mt-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Health Tracker</h1>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <i className="ri-add-line mr-2"></i>
                  Log Health Data
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Log Health Data</DialogTitle>
                </DialogHeader>
                <VitalForm />
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Current Health Stats Overview */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Current Health Stats</h2>
            <HealthOverview healthStats={healthStats || {}} />
          </div>
          
          {/* Health Metrics Tracking */}
          <Card className="mb-6">
            <CardHeader className="pb-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>{metricInfo.title} Tracking</CardTitle>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={timeRange === 'day' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setTimeRange('day')}
                  >
                    Day
                  </Button>
                  <Button 
                    variant={timeRange === 'week' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setTimeRange('week')}
                  >
                    Week
                  </Button>
                  <Button 
                    variant={timeRange === 'month' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setTimeRange('month')}
                  >
                    Month
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="mt-4">
                <TabsList className="flex flex-wrap h-auto mb-4 gap-y-2">
                  <TabsTrigger value="bloodPressure">Blood Pressure</TabsTrigger>
                  <TabsTrigger value="heartRate">Heart Rate</TabsTrigger>
                  <TabsTrigger value="steps">Steps</TabsTrigger>
                  <TabsTrigger value="hydration">Hydration</TabsTrigger>
                  <TabsTrigger value="weight">Weight</TabsTrigger>
                  <TabsTrigger value="sleep">Sleep</TabsTrigger>
                </TabsList>
                
                <TabsContent value={selectedMetric} className="mt-0">
                  {isLoading ? (
                    <div className="h-80 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : !chartData || chartData.length === 0 ? (
                    <div className="h-80 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <i className="ri-line-chart-line text-primary text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-1">No data available</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start tracking your {metricInfo.title.toLowerCase()} to see trends.
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <i className="ri-add-line mr-2"></i>
                            Log {metricInfo.title}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                          <DialogHeader>
                            <DialogTitle>Log Health Data</DialogTitle>
                          </DialogHeader>
                          <VitalForm initialType={selectedMetric} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : selectedMetric === 'bloodPressure' ? (
                    <div className="h-80">
                      <CustomLineChart 
                        data={chartData}
                        lines={[
                          { dataKey: 'systolic', stroke: 'hsl(var(--primary))', name: 'Systolic' },
                          { dataKey: 'diastolic', stroke: 'hsl(var(--secondary))', name: 'Diastolic' }
                        ]}
                        xAxisDataKey="name"
                        grid={true}
                        tooltip={true}
                        legend={true}
                        height={320}
                      />
                    </div>
                  ) : selectedMetric === 'steps' || selectedMetric === 'hydration' ? (
                    <div className="h-80">
                      <CustomBarChart 
                        data={chartData}
                        bars={[
                          { 
                            dataKey: 'value', 
                            fill: selectedMetric === 'steps' ? 'hsl(var(--secondary))' : 'hsl(var(--primary))', 
                            name: metricInfo.title 
                          }
                        ]}
                        xAxisDataKey="name"
                        grid={true}
                        tooltip={true}
                        height={320}
                      />
                    </div>
                  ) : (
                    <div className="h-80">
                      <CustomLineChart 
                        data={chartData}
                        lines={[
                          { dataKey: 'value', stroke: 'hsl(var(--primary))', name: metricInfo.title }
                        ]}
                        xAxisDataKey="name"
                        grid={true}
                        tooltip={true}
                        height={320}
                      />
                    </div>
                  )}
                  
                  {chartData && chartData.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-4">
                      {/* Show latest value */}
                      <Card className="flex-1">
                        <CardContent className="p-4">
                          <div className="text-sm font-medium text-muted-foreground mb-1">Latest {metricInfo.title}</div>
                          <div className="font-mono text-2xl font-bold">
                            {selectedMetric === 'bloodPressure' 
                              ? `${chartData[chartData.length-1].systolic}/${chartData[chartData.length-1].diastolic}` 
                              : chartData[chartData.length-1].value}
                            <span className="ml-1 text-sm font-normal text-muted-foreground">{metricInfo.unit}</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Show average */}
                      <Card className="flex-1">
                        <CardContent className="p-4">
                          <div className="text-sm font-medium text-muted-foreground mb-1">Average</div>
                          <div className="font-mono text-2xl font-bold">
                            {selectedMetric === 'bloodPressure' 
                              ? `${Math.round(chartData.reduce((sum, item) => sum + item.systolic, 0) / chartData.length)}/${
                                  Math.round(chartData.reduce((sum, item) => sum + item.diastolic, 0) / chartData.length)
                                }` 
                              : Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length)}
                            <span className="ml-1 text-sm font-normal text-muted-foreground">{metricInfo.unit}</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Show trend */}
                      {chartData.length > 1 && (
                        <Card className="flex-1">
                          <CardContent className="p-4">
                            <div className="text-sm font-medium text-muted-foreground mb-1">Trend</div>
                            <div className="flex items-center">
                              {selectedMetric === 'bloodPressure' ? (
                                <div className="grid grid-cols-2 gap-2 w-full">
                                  <div className="flex items-center">
                                    <span className="font-mono text-lg font-bold mr-2">Systolic</span>
                                    {chartData[chartData.length-1].systolic > chartData[0].systolic ? (
                                      <i className="ri-arrow-up-fill text-destructive text-xl"></i>
                                    ) : chartData[chartData.length-1].systolic < chartData[0].systolic ? (
                                      <i className="ri-arrow-down-fill text-secondary text-xl"></i>
                                    ) : (
                                      <i className="ri-subtract-fill text-primary text-xl"></i>
                                    )}
                                  </div>
                                  <div className="flex items-center">
                                    <span className="font-mono text-lg font-bold mr-2">Diastolic</span>
                                    {chartData[chartData.length-1].diastolic > chartData[0].diastolic ? (
                                      <i className="ri-arrow-up-fill text-destructive text-xl"></i>
                                    ) : chartData[chartData.length-1].diastolic < chartData[0].diastolic ? (
                                      <i className="ri-arrow-down-fill text-secondary text-xl"></i>
                                    ) : (
                                      <i className="ri-subtract-fill text-primary text-xl"></i>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <span className="font-mono text-2xl font-bold mr-2">
                                    {selectedMetric === 'steps' || selectedMetric === 'hydration' 
                                      ? Math.round(chartData[chartData.length-1].value - chartData[0].value)
                                      : Math.round((chartData[chartData.length-1].value - chartData[0].value) * 10) / 10}
                                  </span>
                                  {chartData[chartData.length-1].value > chartData[0].value ? (
                                    <i className={`ri-arrow-up-fill ${selectedMetric === 'weight' ? 'text-destructive' : 'text-secondary'} text-xl`}></i>
                                  ) : chartData[chartData.length-1].value < chartData[0].value ? (
                                    <i className={`ri-arrow-down-fill ${selectedMetric === 'weight' ? 'text-secondary' : 'text-destructive'} text-xl`}></i>
                                  ) : (
                                    <i className="ri-subtract-fill text-primary text-xl"></i>
                                  )}
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Recent Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : !dummyData || dummyData.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No data entries available</p>
                </div>
              ) : (
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted">
                      <tr>
                        <th scope="col" className="px-4 py-3">Date & Time</th>
                        <th scope="col" className="px-4 py-3">Metric</th>
                        <th scope="col" className="px-4 py-3">Value</th>
                        <th scope="col" className="px-4 py-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dummyData.slice(0, 10).map((entry, index) => (
                        <tr key={entry.id} className="border-b">
                          <td className="px-4 py-3">
                            {formatDate(entry.timestamp)}, {formatTime(entry.timestamp)}
                          </td>
                          <td className="px-4 py-3 capitalize">{entry.type}</td>
                          <td className="px-4 py-3 font-mono">
                            {entry.value} 
                            <span className="text-xs text-muted-foreground ml-1">
                              {entry.type === 'bloodPressure' ? 'mmHg' : 
                                entry.type === 'heartRate' ? 'bpm' : 
                                entry.type === 'weight' ? 'kg' : 
                                entry.type === 'sleep' ? 'hours' : 
                                entry.type === 'hydration' ? 'glasses' : ''}
                            </span>
                          </td>
                          <td className="px-4 py-3 max-w-[200px] truncate">{entry.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
