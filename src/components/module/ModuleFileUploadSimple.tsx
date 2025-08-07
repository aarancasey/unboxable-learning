import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, X, File, Globe, AlertCircle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ModuleFileUploadSimpleProps {
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
  googleDocsLinks: string[];
  setGoogleDocsLinks: (links: string[]) => void;
}

export const ModuleFileUploadSimple = ({ 
  uploadedFiles, 
  setUploadedFiles,
  googleDocsLinks,
  setGoogleDocsLinks 
}: ModuleFileUploadSimpleProps) => {
  const [googleDocsUrl, setGoogleDocsUrl] = useState('');
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `${file.name} is larger than 50MB. Please choose a smaller file.`,
        variant: "destructive"
      });
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `${file.name} is not a supported document format.`,
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const validateGoogleDocsUrl = (url: string): boolean => {
    const googleDocsPattern = /^https:\/\/(docs|drive)\.google\.com\/(document|file|presentation|spreadsheets)/;
    return googleDocsPattern.test(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const totalItems = uploadedFiles.length + googleDocsLinks.length;
    const remainingSlots = 5 - totalItems;
    
    if (remainingSlots <= 0) {
      toast({
        title: "Upload limit reached",
        description: "You can only upload up to 5 items total (files + links).",
        variant: "destructive"
      });
      event.target.value = '';
      return;
    }
    
    const filesToUpload = files.slice(0, remainingSlots);
    const validFiles = filesToUpload.filter(validateFile);
    
    if (validFiles.length > 0) {
      setUploadedFiles([...uploadedFiles, ...validFiles]);
      
      if (files.length > remainingSlots) {
        toast({
          title: "Some files not uploaded",
          description: `Only ${validFiles.length} file(s) uploaded. Maximum 5 items allowed.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Files uploaded",
          description: `Successfully uploaded ${validFiles.length} document(s).`,
        });
      }
    }
    
    // Reset input
    event.target.value = '';
  };

  const handleGoogleDocsAdd = () => {
    if (!googleDocsUrl.trim()) {
      toast({
        title: "Missing URL",
        description: "Please enter a Google Docs URL.",
        variant: "destructive"
      });
      return;
    }

    if (!validateGoogleDocsUrl(googleDocsUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Google Docs, Sheets, or Slides URL.",
        variant: "destructive"
      });
      return;
    }

    const totalItems = uploadedFiles.length + googleDocsLinks.length;
    if (totalItems >= 5) {
      toast({
        title: "Upload limit reached",
        description: "You can only upload up to 5 items total (files + links).",
        variant: "destructive"
      });
      return;
    }

    setGoogleDocsLinks([...googleDocsLinks, googleDocsUrl]);
    setGoogleDocsUrl('');
    
    toast({
      title: "Google Doc added",
      description: "Google Docs link has been added to the module.",
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const removeGoogleDoc = (index: number) => {
    setGoogleDocsLinks(googleDocsLinks.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName: string) => {
    const name = fileName.toLowerCase();
    if (name.endsWith('.pdf')) {
      return <File className="h-4 w-4 text-red-500" />;
    } else if (name.endsWith('.doc') || name.endsWith('.docx')) {
      return <FileText className="h-4 w-4 text-blue-600" />;
    } else {
      return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Course Documents</Label>
              <div className="text-sm text-muted-foreground">
                {uploadedFiles.length + googleDocsLinks.length}/5 items
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Add supporting materials, resources, and documents for this module (maximum 5 items)
            </p>
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Upload Files</Label>
              <div>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={uploadedFiles.length + googleDocsLinks.length >= 5}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
              </div>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Supported formats: PDF, Word documents (.doc, .docx), PowerPoint (.ppt, .pptx), Text files (.txt). Maximum size: 50MB per file.
              </AlertDescription>
            </Alert>
          </div>

          {/* Google Docs Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Add Google Docs Link</Label>
            <div className="flex space-x-2">
              <Input
                type="url"
                placeholder="https://docs.google.com/document/d/..."
                value={googleDocsUrl}
                onChange={(e) => setGoogleDocsUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGoogleDocsAdd}
                disabled={!googleDocsUrl.trim() || uploadedFiles.length + googleDocsLinks.length >= 5}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Make sure the Google Doc is shared publicly or with your organisation before adding the link.
            </p>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Uploaded Files ({uploadedFiles.length})</Label>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {getFileIcon(file.name)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-destructive hover:text-destructive ml-2 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Google Docs Links List */}
          {googleDocsLinks.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Google Docs Links ({googleDocsLinks.length})</Label>
              <div className="space-y-2">
                {googleDocsLinks.map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Google Document</p>
                        <p className="text-xs text-muted-foreground truncate">{link}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGoogleDoc(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};