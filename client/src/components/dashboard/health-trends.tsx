import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomLineChart } from '@/components/ui/custom-chart';

interface HealthTrendsProps {
  data: {
    heartRate: Array<{ time: string; value: number }>;
    bloodPressure: Array<{ time: string; systolic: number; diastolic: number }>;
  };
}

type TimeFrame = 'day' | 'week' | 'month';

export function HealthTrends({ data }: HealthTrendsProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('day');

  // Transform data for chart visualization
  const chartData = data.heartRate.map((item, index) => {
    const bp = data.bloodPressure[index];
    return {
      name: item.time,
      heartRate: item.value,
      bloodPressureSystolic: bp?.systolic,
      bloodPressureDiastolic: bp?.diastolic,
    };
  });

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-foreground">Health Trends</h2>
          <div className="flex space-x-2">
            <Button 
              variant={timeFrame === 'day' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setTimeFrame('day')}
              className="text-xs h-7"
            >
              Day
            </Button>
            <Button 
              variant={timeFrame === 'week' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setTimeFrame('week')}
              className="text-xs h-7"
            >
              Week
            </Button>
            <Button 
              variant={timeFrame === 'month' ? 'primary' : 'outline'} 
              size="sm"
              onClick={() => setTimeFrame('month')}
              className="text-xs h-7"
            >
              Month
            </Button>
          </div>
        </div>
        
        <div className="h-64 relative">
          <CustomLineChart 
            data={chartData}
            lines={[
              { dataKey: 'heartRate', stroke: 'hsl(var(--primary))', name: 'Heart Rate' },
              { dataKey: 'bloodPressureSystolic', stroke: 'hsl(var(--secondary))', name: 'Blood Pressure (Systolic)' },
              { dataKey: 'bloodPressureDiastolic', stroke: 'hsl(var(--muted-foreground))', name: 'Blood Pressure (Diastolic)' }
            ]}
            xAxisDataKey="name"
            grid={true}
            tooltip={true}
            height={250}
          />
          
          <div className="absolute bottom-0 right-0 flex items-center space-x-4 p-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-primary mr-1"></div>
              <span className="text-xs text-muted-foreground">Heart Rate</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-secondary mr-1"></div>
              <span className="text-xs text-muted-foreground">Blood Pressure</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
