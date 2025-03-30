import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, MedicineScan } from '@shared/schema';
import { ScannerResult } from '@/components/medicine-scanner/scanner-result';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { analyzeMedicine } from '@/lib/openai';
import { formatDate, formatTime } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

export default function MedicineScanner() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });
  
  const { data: scannedMedicines, isLoading } = useQuery<MedicineScan[]>({
    queryKey: ['/api/medicine-scans'],
  });
  
  const analyzeMedicineMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      return analyzeMedicine(imageBase64);
    },
    onSuccess: (data) => {
      if (!data) {
        toast({
          title: "Scan failed",
          description: "Unable to identify medicine. Please try again with a clearer image.",
          variant: "destructive"
        });
        return;
      }
      
      setScanResult(data);
    },
    onError: (error) => {
      toast({
        title: "Scan failed",
        description: error instanceof Error ? error.message : "Unable to analyze the medicine",
        variant: "destructive"
      });
    }
  });
  
  const saveScanMutation = useMutation({
    mutationFn: async (scanData: any) => {
      const data = {
        userId: user?.id || 1,
        medicineName: scanData.medicineName,
        dosage: scanData.dosage,
        timing: scanData.purpose,
        sideEffects: scanData.sideEffects,
      };
      
      const res = await apiRequest('POST', '/api/medicine-scans', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medicine-scans'] });
      toast({
        title: "Scan saved",
        description: "Medicine information has been saved to your records.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving scan",
        description: error instanceof Error ? error.message : "Failed to save medicine scan",
        variant: "destructive"
      });
    }
  });
  
  // Start camera capture
  const startCapture = async () => {
    setIsCapturing(true);
    setScanResult(null);
    setImageData(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      toast({
        title: "Camera access error",
        description: "Unable to access your camera. Please check your permissions.",
        variant: "destructive"
      });
      setIsCapturing(false);
    }
  };
  
  // Capture image from camera
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setImageData(imageDataUrl);
      
      // Stop video stream
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      setIsCapturing(false);
      
      // Extract base64 data (remove data:image/jpeg;base64, prefix)
      const base64Data = imageDataUrl.split(',')[1];
      
      // Analyze the medicine image
      analyzeMedicineMutation.mutate(base64Data);
    }
  };
  
  // Handle save scan result
  const handleSaveScan = () => {
    if (scanResult) {
      saveScanMutation.mutate(scanResult);
    }
  };
  
  // Default user data for development
  const defaultUser: Partial<User> = {
    firstName: 'Sarah',
    lastName: 'Johnson',
  };

  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar user={user || defaultUser} />
      <MobileSidebar user={user || defaultUser} />
      
      <main className="flex-1 overflow-auto pt-0 md:pt-0 mt-16 md:mt-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Medicine Scanner</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Scan Medicine Label</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    {!isCapturing && !imageData && !scanResult && (
                      <div className="mb-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <i className="ri-scan-2-line text-primary text-4xl"></i>
                          </div>
                          <h3 className="text-lg font-medium text-foreground mb-2">Medicine Scanner</h3>
                          <p className="text-muted-foreground max-w-md mb-6">
                            Use your camera to scan a medicine label to get detailed information about the medication, including dosage, purpose, and potential side effects.
                          </p>
                          <Button onClick={startCapture} size="lg">
                            <i className="ri-camera-line mr-2"></i>
                            Start Scanner
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {isCapturing && (
                      <div className="relative w-full max-w-lg">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full rounded-lg border border-primary"
                        />
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-primary rounded-lg pointer-events-none"></div>
                        <p className="text-center text-sm text-muted-foreground mt-2 mb-4">
                          Position the medicine label within the frame and ensure it's clearly visible
                        </p>
                        <div className="flex justify-center gap-2">
                          <Button onClick={() => setIsCapturing(false)} variant="outline">
                            Cancel
                          </Button>
                          <Button onClick={captureImage}>
                            <i className="ri-camera-line mr-2"></i>
                            Capture Image
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {imageData && (
                      <div className="w-full max-w-lg">
                        <div className="relative">
                          <img 
                            src={imageData} 
                            alt="Captured medicine label" 
                            className="w-full rounded-lg border border-muted"
                          />
                          {analyzeMedicineMutation.isPending && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                              <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-2"></div>
                                <p className="text-white">Analyzing medicine label...</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-center gap-2 mt-4">
                          <Button onClick={startCapture} variant="outline">
                            Scan Again
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <canvas ref={canvasRef} className="hidden"></canvas>
                  </div>
                  
                  {scanResult && (
                    <div className="mt-6">
                      <Separator className="my-4" />
                      <ScannerResult 
                        result={scanResult} 
                        onSave={handleSaveScan}
                        isSaving={saveScanMutation.isPending}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Recently Scanned Medicines</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : !scannedMedicines || scannedMedicines.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">No medicine scans yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Scan your first medicine to see it here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {scannedMedicines.map((medicine) => (
                        <Card key={medicine.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-1">
                                <i className="ri-medicine-bottle-line text-primary"></i>
                              </div>
                              <div>
                                <h3 className="font-medium">{medicine.medicineName}</h3>
                                {medicine.dosage && (
                                  <p className="text-sm text-muted-foreground">
                                    Dosage: {medicine.dosage}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  Scanned on {formatDate(medicine.scannedAt)}, {formatTime(medicine.scannedAt)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
