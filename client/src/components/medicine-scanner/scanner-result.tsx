import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ScannerResultProps {
  result: {
    medicineName: string;
    dosage: string;
    purpose: string;
    sideEffects: string[];
    warnings: string[];
  };
  onSave: () => void;
  isSaving: boolean;
}

export function ScannerResult({ result, onSave, isSaving }: ScannerResultProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-6">Scan Results</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Medicine Name</h4>
              <p className="text-lg font-medium">{result.medicineName}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Dosage</h4>
              <p>{result.dosage || 'Not specified'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Purpose</h4>
              <p>{result.purpose || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Side Effects</h4>
              {result.sideEffects && result.sideEffects.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {result.sideEffects.map((effect, index) => (
                    <li key={index}>{effect}</li>
                  ))}
                </ul>
              ) : (
                <p>No side effects listed</p>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Warnings</h4>
              {result.warnings && result.warnings.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {result.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              ) : (
                <p>No warnings listed</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Disclaimer:</strong> This information is provided for reference only. Always consult with a healthcare professional for medical advice and follow the instructions provided by your doctor or pharmacist.
        </p>
      </div>
      
      <div className="pt-4 flex justify-between">
        <Button variant="outline">
          <i className="ri-printer-line mr-2"></i>
          Print
        </Button>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <span className="animate-spin mr-2">
                <i className="ri-loader-4-line"></i>
              </span>
              Saving...
            </>
          ) : (
            <>
              <i className="ri-save-line mr-2"></i>
              Save to Records
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
