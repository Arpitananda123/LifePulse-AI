import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { HealthStats } from '@shared/schema';
import { formatNumber } from '@/lib/utils';

interface HealthOverviewProps {
  healthStats: Partial<HealthStats>;
}

export function HealthOverview({ healthStats }: HealthOverviewProps) {
  const stepsProgress = healthStats.steps && healthStats.stepsGoal 
    ? Math.min(Math.round((healthStats.steps / healthStats.stepsGoal) * 100), 100) 
    : 0;
  
  const hydrationProgress = healthStats.hydrationGlasses && healthStats.hydrationGoal 
    ? Math.min(Math.round((healthStats.hydrationGlasses / healthStats.hydrationGoal) * 100), 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* BP Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">Blood Pressure</h3>
            <div className={cn(
              "text-xs px-2 py-1 rounded-full",
              healthStats.bloodPressureStatus === 'Normal' 
                ? "bg-primary/10 text-primary" 
                : healthStats.bloodPressureStatus === 'High'
                ? "bg-destructive/10 text-destructive"
                : "bg-warning/10 text-amber-600"
            )}>
              {healthStats.bloodPressureStatus || 'Normal'}
            </div>
          </div>
          <div className="flex items-end">
            <span className="text-2xl font-bold font-mono text-foreground">
              {healthStats.bloodPressure || '120/80'}
            </span>
            <span className="ml-1 text-sm text-muted-foreground">mmHg</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground flex items-center">
            <i className="ri-history-line mr-1"></i> 2 hours ago
          </div>
        </CardContent>
      </Card>
      
      {/* Heart Rate Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">Heart Rate</h3>
            <div className={cn(
              "text-xs px-2 py-1 rounded-full",
              healthStats.heartRateStatus === 'Normal' 
                ? "bg-primary/10 text-primary" 
                : healthStats.heartRateStatus === 'High'
                ? "bg-destructive/10 text-destructive"
                : "bg-warning/10 text-amber-600"
            )}>
              {healthStats.heartRateStatus || 'Normal'}
            </div>
          </div>
          <div className="flex items-end">
            <span className="text-2xl font-bold font-mono text-foreground">
              {healthStats.heartRate || '72'}
            </span>
            <span className="ml-1 text-sm text-muted-foreground">bpm</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground flex items-center">
            <i className="ri-history-line mr-1"></i> 1 hour ago
          </div>
        </CardContent>
      </Card>
      
      {/* Steps Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">Steps</h3>
            <div className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
              {stepsProgress >= 100 ? 'Completed' : 'On Track'}
            </div>
          </div>
          <div className="flex items-end">
            <span className="text-2xl font-bold font-mono text-foreground">
              {healthStats.steps ? formatNumber(healthStats.steps) : '6,584'}
            </span>
            <span className="ml-1 text-sm text-muted-foreground">
              / {healthStats.stepsGoal ? formatNumber(healthStats.stepsGoal) : '10,000'}
            </span>
          </div>
          <div className="mt-2">
            <Progress value={stepsProgress} className="h-2 bg-muted" />
          </div>
        </CardContent>
      </Card>
      
      {/* Hydration Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-foreground">Hydration</h3>
            <div className={cn(
              "text-xs px-2 py-1 rounded-full",
              hydrationProgress >= 75 
                ? "bg-green-50 text-green-600" 
                : hydrationProgress >= 50
                ? "bg-primary/10 text-primary"
                : "bg-amber-50 text-amber-600"
            )}>
              {hydrationProgress >= 75 
                ? 'Good' 
                : hydrationProgress >= 50
                ? 'Adequate'
                : 'Needs Attention'
              }
            </div>
          </div>
          <div className="flex items-end">
            <span className="text-2xl font-bold font-mono text-foreground">
              {healthStats.hydrationGlasses || '3'}/{healthStats.hydrationGoal || '8'}
            </span>
            <span className="ml-1 text-sm text-muted-foreground">glasses</span>
          </div>
          <div className="mt-2">
            <Progress 
              value={hydrationProgress} 
              className={cn(
                "h-2 bg-muted",
                hydrationProgress >= 75 
                  ? "text-green-500" 
                  : hydrationProgress >= 50
                  ? "text-primary"
                  : "text-amber-500"
              )} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
