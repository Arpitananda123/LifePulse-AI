import { useState, useEffect } from "react";
import { useLocation, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
});

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, isLoading, loginMutation, registerMutation, googleLoginMutation } = useAuth();
  const [location, navigate] = useLocation();
  
  // Extract redirect URL from query params
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const redirectPath = searchParams.get("redirect") || "/";
  
  // Setup form for login
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Setup form for registration
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      email: "",
    },
  });
  
  // Handle login form submission
  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        navigate(redirectPath);
      },
    });
  };
  
  // Handle registration form submission
  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(values, {
      onSuccess: () => {
        navigate(redirectPath);
      },
    });
  };
  
  // Handle Google sign-in
  const handleGoogleSignIn = () => {
    googleLoginMutation.mutate(undefined, {
      onSuccess: () => {
        navigate(redirectPath);
      },
    });
  };
  
  // If user is already authenticated, redirect to the requested page
  useEffect(() => {
    if (user && !isLoading) {
      navigate(redirectPath);
    }
  }, [user, isLoading, navigate, redirectPath]);
  
  if (user && !isLoading) {
    return <Redirect to={redirectPath} />;
  }
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side: Auth forms */}
      <div className="flex flex-col w-full lg:w-1/2 p-4 sm:p-8 justify-center">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome to LifePulse</h1>
          <p className="text-muted-foreground mb-8">
            Your comprehensive health management platform
          </p>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login to your account</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your health dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          "Log in"
                        )}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="w-full" 
                    onClick={handleGoogleSignIn}
                    disabled={googleLoginMutation.isPending}
                  >
                    {googleLoginMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FcGoogle className="mr-2 h-5 w-5" />
                    )}
                    Google
                  </Button>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <div className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      className="text-primary underline-offset-4 hover:underline"
                      onClick={() => setActiveTab("register")}
                    >
                      Register
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Register Tab */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Join LifePulse to track and improve your health
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="First name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          "Register"
                        )}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoginMutation.isPending}
                  >
                    {googleLoginMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FcGoogle className="mr-2 h-5 w-5" />
                    )}
                    Google
                  </Button>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <div className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="text-primary underline-offset-4 hover:underline"
                      onClick={() => setActiveTab("login")}
                    >
                      Login
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right side: Hero/info section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 to-primary/5">
        <div className="flex flex-col p-12 justify-center">
          <h1 className="text-4xl font-bold mb-4">LifePulse</h1>
          <h2 className="text-xl font-medium mb-6 text-foreground/90">Your Complete Health Companion</h2>
          
          <div className="space-y-6">
            <div className="bg-background/80 backdrop-blur-md p-4 rounded-lg shadow">
              <h3 className="font-medium mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Track Your Health Metrics
              </h3>
              <p className="text-sm text-muted-foreground">Monitor vital signs, medication schedules, and health trends over time.</p>
            </div>
            
            <div className="bg-background/80 backdrop-blur-md p-4 rounded-lg shadow">
              <h3 className="font-medium mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Smart Reminders
              </h3>
              <p className="text-sm text-muted-foreground">Never miss important medications, appointments, or health activities.</p>
            </div>
            
            <div className="bg-background/80 backdrop-blur-md p-4 rounded-lg shadow">
              <h3 className="font-medium mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI-Powered Insights
              </h3>
              <p className="text-sm text-muted-foreground">Receive personalized health recommendations and insights based on your data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}