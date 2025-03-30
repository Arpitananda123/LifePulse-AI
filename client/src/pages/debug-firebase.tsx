import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function DebugFirebase() {
  const [apiKey, setApiKey] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [appId, setAppId] = useState<string>("");
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  useEffect(() => {
    // Get environment variables
    setApiKey(import.meta.env.VITE_FIREBASE_API_KEY || "Not set");
    setProjectId(import.meta.env.VITE_FIREBASE_PROJECT_ID || "Not set");
    setAppId(import.meta.env.VITE_FIREBASE_APP_ID || "Not set");
  }, []);
  
  const testFirebaseConnection = async () => {
    try {
      // Just calling auth.app checks if Firebase is initialized properly
      const app = auth.app;
      setTestResult({ 
        success: true, 
        message: "Firebase successfully initialized! App name: " + app.name 
      });
    } catch (error) {
      console.error("Firebase test error:", error);
      setTestResult({ 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Firebase Configuration Debug</CardTitle>
          <CardDescription>
            This page shows the current Firebase environment variables. 
            Make sure they are properly set and formatted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">API Key:</div>
            <div>{apiKey ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}` : "Not set"}</div>
            
            <div className="font-medium">Project ID:</div>
            <div>{projectId}</div>
            
            <div className="font-medium">App ID:</div>
            <div>{appId ? `${appId.substring(0, 5)}...${appId.substring(appId.length - 5)}` : "Not set"}</div>
          </div>
          
          <Button onClick={testFirebaseConnection} className="mt-4">
            Test Firebase Connection
          </Button>
          
          {testResult && (
            <Alert variant={testResult.success ? "default" : "destructive"} className="mt-4">
              {testResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle>{testResult.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Debugging Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Verify that your Firebase variables are correctly set in the .env file</li>
            <li>Check that the API key is valid and has the necessary permissions</li>
            <li>Make sure Firebase Authentication is enabled in your Firebase console</li>
            <li>Enable Google sign-in method in the Firebase Authentication settings</li>
            <li>Add your Replit URL to the authorized domains in Firebase Authentication settings</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}