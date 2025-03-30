import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { User, Achievement } from '@shared/schema';
import { formatNumber } from '@/lib/utils';

interface RewardsProps {
  user: Partial<User>;
  achievements: Achievement[];
}

export function Rewards({ user, achievements }: RewardsProps) {
  const streakProgress = user.streak && user.streakGoal
    ? Math.min(Math.round((user.streak / user.streakGoal) * 100), 100)
    : 0;
  
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-foreground">Rewards & Tokens</h2>
          <Button variant="link" size="sm" className="text-primary">
            View All
          </Button>
        </div>
        
        <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-4 text-white mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-medium">Your Balance</h3>
              <p className="text-xs opacity-80">Valid through Dec 2023</p>
            </div>
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <i className="ri-coin-line text-white"></i>
            </div>
          </div>
          
          <div className="text-2xl font-bold mb-2">
            {user.tokenBalance ? formatNumber(user.tokenBalance) : '0'}
          </div>
          
          <div className="text-xs">
            <span className="opacity-80">Lifetime earned:</span>
            <span className="font-medium ml-1">
              {user.lifetimeTokens ? formatNumber(user.lifetimeTokens) : '0'}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="font-medium text-foreground mb-2">Current Streak</h3>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  Day {user.streak || 0} of {user.streakGoal || 7}
                </span>
                <span className="text-xs font-medium text-primary">{streakProgress}%</span>
              </div>
              <Progress value={streakProgress} className="h-2" />
            </div>
            <div className="ml-3 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <i className="ri-fire-fill text-primary"></i>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-foreground mb-2">Recent Achievements</h3>
          {achievements.length === 0 ? (
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-muted-foreground text-sm">No achievements yet. Keep using the app to earn rewards.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {achievements.slice(0, 3).map((achievement, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-1">
                    <i className={`${achievement.icon || 'ri-award-line'} text-primary text-xl`}></i>
                  </div>
                  <span className="text-xs text-muted-foreground text-center">{achievement.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
