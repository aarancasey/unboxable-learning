import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, Loader2 } from 'lucide-react';
import { downloadTemplate } from './utils';

interface FileUploadSectionProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isProcessing: boolean;
  progress?: number;
  progressMessage?: string;
}

export const FileUploadSection = ({ onFileUpload, isProcessing, progress = 0, progressMessage = '' }: FileUploadSectionProps) => {
  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={downloadTemplate}
        className="w-full"
      >
        <Download className="h-4 w-4 mr-2" />
        Download Template
      </Button>
      
      <Card>
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {isProcessing ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Processing file...</p>
                  <p className="text-sm text-muted-foreground">{progressMessage}</p>
                  <Progress value={progress} className="w-full max-w-sm mx-auto" />
                  <p className="text-xs text-muted-foreground">{progress}% complete</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Choose a file to upload</p>
                  <p className="text-gray-500">CSV or Excel files accepted (max 10MB)</p>
                  <Button 
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={isProcessing}
                    className="relative"
                  >
                    Select File
                  </Button>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={onFileUpload}
                    className="absolute opacity-0 w-0 h-0 overflow-hidden"
                    id="file-upload"
                    disabled={isProcessing}
                    style={{ position: 'absolute', left: '-9999px' }}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};