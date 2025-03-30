import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTheme } from "@/hooks/use-theme";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white mr-2">
              <i className="ri-heart-pulse-fill text-xl"></i>
            </div>
            <h1 className="text-xl font-bold text-foreground">LifePulse AI</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <i className="ri-sun-line mr-2"></i>
              ) : (
                <i className="ri-moon-line mr-2"></i>
              )}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Link href="/dashboard">
              <Button size="sm">
                <i className="ri-login-box-line mr-2"></i>
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-20 flex-grow flex items-center">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Your Personal 
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"> Health Assistant</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              LifePulse AI combines cutting-edge AI technology with comprehensive health tracking to help you make informed decisions about your well-being.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="px-8">
                  Get Started
                  <i className="ri-arrow-right-line ml-2"></i>
                </Button>
              </Link>
              <Link href="/ai-companion">
                <Button size="lg" variant="outline" className="px-8">
                  <i className="ri-robot-line mr-2"></i>
                  Try AI Companion
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="w-full max-w-lg rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/20 p-1">
              <div className="bg-background rounded-xl p-8">
                <div className="flex items-start mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <i className="ri-robot-line text-primary"></i>
                  </div>
                  <div className="bg-muted/40 text-sm p-3 rounded-tl-lg rounded-tr-lg rounded-br-lg">
                    <p>Hello! I'm your HealthPal AI assistant. I can help you keep track of your health, remind you about medications, and provide personalized wellness tips.</p>
                  </div>
                </div>
                
                <div className="flex items-start justify-end mb-6">
                  <div className="bg-primary/10 text-sm p-3 rounded-tl-lg rounded-tr-lg rounded-bl-lg">
                    <p>Can you remind me to take my medication daily?</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-muted overflow-hidden ml-3">
                    <div className="w-full h-full flex items-center justify-center bg-primary/40 text-primary">
                      U
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                    <i className="ri-robot-line text-primary"></i>
                  </div>
                  <div className="bg-muted/40 text-sm p-3 rounded-tl-lg rounded-tr-lg rounded-br-lg">
                    <p>Absolutely! I can set up daily medication reminders for you. You'll receive notifications at your preferred times, and you can mark them as completed once taken.</p>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="h-10 border border-input rounded-full flex items-center px-3 opacity-60">
                    <span className="text-muted-foreground">Type your message...</span>
                    <div className="ml-auto w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                      <i className="ri-send-plane-fill"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Comprehensive Health Management
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              LifePulse AI provides a complete solution for monitoring and improving your health with powerful, easy-to-use tools.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <i className="ri-heart-pulse-line text-primary text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Health Tracking</h3>
              <p className="text-muted-foreground">
                Monitor vital health metrics like heart rate, blood pressure, and activity levels with intuitive visualizations.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <i className="ri-notification-3-line text-primary text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Medication Reminders</h3>
              <p className="text-muted-foreground">
                Never miss a dose with customizable medication reminders and scheduling tools.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <i className="ri-calendar-check-line text-primary text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Appointment Management</h3>
              <p className="text-muted-foreground">
                Schedule and keep track of all your medical appointments with automated reminders.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <i className="ri-robot-line text-primary text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">AI Health Assistant</h3>
              <p className="text-muted-foreground">
                Get personalized health recommendations and answers to your health questions from our AI companion.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <i className="ri-medicine-bottle-line text-primary text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Medicine Scanner</h3>
              <p className="text-muted-foreground">
                Scan medication labels to quickly access information about dosage, side effects, and interactions.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-background rounded-xl p-6 shadow-sm border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <i className="ri-award-line text-primary text-xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Health Rewards</h3>
              <p className="text-muted-foreground">
                Stay motivated with achievement badges and rewards for maintaining healthy habits.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-purple-600/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Ready to take control of your health?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of users who are already benefiting from LifePulse AI's powerful health management tools.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              Get Started Now
              <i className="ri-arrow-right-line ml-2"></i>
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-2">
                <i className="ri-heart-pulse-fill"></i>
              </div>
              <span className="text-lg font-semibold text-foreground">LifePulse AI</span>
            </div>
            
            <div className="flex gap-4 mb-6 md:mb-0">
              <Button variant="ghost" size="sm">
                <i className="ri-user-settings-line mr-2"></i>
                Privacy Policy
              </Button>
              <Button variant="ghost" size="sm">
                <i className="ri-file-list-3-line mr-2"></i>
                Terms of Service
              </Button>
              <Button variant="ghost" size="sm">
                <i className="ri-customer-service-2-line mr-2"></i>
                Contact Support
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © 2025 LifePulse AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}