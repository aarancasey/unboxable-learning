import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Download } from 'lucide-react';
import { downloadTemplate } from './utils';

interface FileUploadSectionProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isProcessing: boolean;
}

export const FileUploadSection = ({ onFileUpload, isProcessing }: FileUploadSectionProps) => {
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
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Choose a file to upload</p>
              <p className="text-gray-500">CSV or Excel files accepted</p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={onFileUpload}
                className="hidden"
                id="file-upload"
                disabled={isProcessing}
              />
              <label htmlFor="file-upload">
                <Button asChild disabled={isProcessing}>
                  <span className="cursor-pointer">
                    {isProcessing ? 'Processing...' : 'Select File'}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};