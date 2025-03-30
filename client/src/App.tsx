import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Reminders from "@/pages/reminders";
import AiCompanionPage from "@/pages/ai-companion";
import Appointments from "@/pages/appointments";
import HomeRemedies from "@/pages/home-remedies";
import HealthTracker from "@/pages/health-tracker";
import MedicineScanner from "@/pages/medicine-scanner";
import Rewards from "@/pages/rewards";
import Profile from "@/pages/profile";
import EmergencyContacts from "@/pages/emergency-contacts";
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Import the debug page
import DebugFirebase from "@/pages/debug-firebase";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/debug-firebase" component={DebugFirebase} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/reminders" component={Reminders} />
      <ProtectedRoute path="/ai-companion" component={AiCompanionPage} />
      <ProtectedRoute path="/appointments" component={Appointments} />
      <ProtectedRoute path="/home-remedies" component={HomeRemedies} />
      <ProtectedRoute path="/health-tracker" component={HealthTracker} />
      <ProtectedRoute path="/medicine-scanner" component={MedicineScanner} />
      <ProtectedRoute path="/rewards" component={Rewards} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/emergency-contacts" component={EmergencyContacts} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="lifepulse-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
