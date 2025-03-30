import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';

export function QuickActions() {
  const actions = [
    { 
      label: 'Scan Medicine', 
      icon: 'ri-scan-2-line',
      href: '/medicine-scanner',
      bgColor: 'bg-primary/10', 
      iconColor: 'text-primary'
    },
    { 
      label: 'Log Vitals', 
      icon: 'ri-heart-pulse-line',
      href: '/health-tracker',
      bgColor: 'bg-secondary/10', 
      iconColor: 'text-secondary'
    },
    { 
      label: 'Home Remedies', 
      icon: 'ri-medicine-bottle-line',
      href: '/home-remedies',
      bgColor: 'bg-muted', 
      iconColor: 'text-muted-foreground'
    },
    { 
      label: 'Emergency', 
      icon: 'ri-emergency-case-line',
      href: '/emergency-contacts',
      bgColor: 'bg-muted', 
      iconColor: 'text-muted-foreground'
    }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold text-lg text-foreground mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <a className={`flex flex-col items-center justify-center p-3 ${action.bgColor} rounded-lg hover:opacity-90 transition-opacity`}>
                <i className={`${action.icon} ${action.iconColor} text-xl mb-1`}></i>
                <span className="text-xs text-foreground">{action.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
