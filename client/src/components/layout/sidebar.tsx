import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { User } from '@shared/schema';
import { ThemeToggle } from '@/components/theme/theme-toggle';

interface SidebarProps {
  user: Partial<User>;
}

export function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'ri-dashboard-line' },
    { href: '/reminders', label: 'Reminders', icon: 'ri-notification-3-line' },
    { href: '/ai-companion', label: 'AI Companion', icon: 'ri-message-3-line' },
    { href: '/appointments', label: 'Appointments', icon: 'ri-calendar-check-line' },
    { href: '/home-remedies', label: 'Home Remedies', icon: 'ri-medicine-bottle-line' },
    { href: '/health-tracker', label: 'Health Tracker', icon: 'ri-heart-line' },
    { href: '/medicine-scanner', label: 'Medicine Scanner', icon: 'ri-scan-2-line' },
    { href: '/rewards', label: 'Rewards & Tokens', icon: 'ri-award-line' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background shadow-lg h-screen">
      <div className="p-5 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="ri-heart-pulse-fill text-primary-foreground text-xl"></i>
          </div>
          <h1 className="font-bold text-xl text-foreground">LifePulse <span className="text-primary">AI</span></h1>
        </div>
      </div>
      
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <a className={cn(
                    "flex items-center px-4 py-3 rounded-lg", 
                    isActive 
                      ? "text-foreground bg-primary/10" 
                      : "text-muted-foreground hover:bg-muted"
                  )}>
                    <i className={cn(item.icon, "mr-3", isActive ? "text-primary" : "")}></i>
                    <span>{item.label}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-3 border-t border-border">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">APPEARANCE</p>
          <ThemeToggle />
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
            {user.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={`${user.firstName} ${user.lastName}`} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground">
                {user.firstName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {user.firstName} {user.lastName}
            </p>
            <Link href="/profile">
              <a className="text-xs text-muted-foreground hover:text-primary">
                View Profile
              </a>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
