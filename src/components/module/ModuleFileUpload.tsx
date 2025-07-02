
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, X, File, Globe, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadedDocument {
  file?: File;
  url?: string;
  name: string;
  type: 'file' | 'google-docs';
  size?: number;
}

interface ModuleFileUploadProps {
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
}

export const ModuleFileUpload = ({ uploadedFiles, setUploadedFiles }: ModuleFileUploadProps) => {
  const [googleDocsUrl, setGoogleDocsUrl] = useState('');
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
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
    const validFiles = files.filter(validateFile);
    
    if (validFiles.length > 0) {
      setUploadedFiles([...uploadedFiles, ...validFiles]);
      
      const newDocuments: UploadedDocument[] = validFiles.map(file => ({
        file,
        name: file.name,
        type: 'file',
        size: file.size
      }));
      
      setDocuments(prev => [...prev, ...newDocuments]);
      
      toast({
        title: "Files uploaded",
        description: `Successfully uploaded ${validFiles.length} document(s).`,
      });
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

    // Extract document name from URL or use a default
    let docName = 'Google Document';
    try {
      const url = new URL(googleDocsUrl);
      const pathParts = url.pathname.split('/');
      if (pathParts.length > 3) {
        docName = `Google Document (${pathParts[1]})`;
      }
    } catch (e) {
      // Use default name if URL parsing fails
    }

    const newDocument: UploadedDocument = {
      url: googleDocsUrl,
      name: docName,
      type: 'google-docs'
    };

    setDocuments(prev => [...prev, newDocument]);
    setGoogleDocsUrl('');
    
    toast({
      title: "Google Doc added",
      description: "Google Docs link has been added to the module.",
    });
  };

  const removeDocument = (index: number) => {
    const documentToRemove = documents[index];
    
    if (documentToRemove.type === 'file' && documentToRemove.file) {
      // Remove from uploadedFiles if it's a file
      const fileIndex = uploadedFiles.indexOf(documentToRemove.file);
      if (fileIndex > -1) {
        setUploadedFiles(uploadedFiles.filter((_, i) => i !== fileIndex));
      }
    }
    
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const getFileIcon = (document: UploadedDocument) => {
    if (document.type === 'google-docs') {
      return <Globe className="h-4 w-4 text-blue-500" />;
    }
    
    const fileName = document.name.toLowerCase();
    if (fileName.endsWith('.pdf')) {
      return <File className="h-4 w-4 text-red-500" />;
    } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
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
            <Label className="text-base font-medium">Course Documents</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Add supporting materials, resources, and documents for this module
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
              <div className="flex-1">
                <input
                  type="url"
                  placeholder="https://docs.google.com/document/d/..."
                  value={googleDocsUrl}
                  onChange={(e) => setGoogleDocsUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGoogleDocsAdd}
                disabled={!googleDocsUrl.trim()}
              >
                <Globe className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Make sure the Google Doc is shared publicly or with your organization before adding the link.
            </p>
          </div>

          {/* Documents List */}
          {documents.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Added Documents ({documents.length})</Label>
              <div className="space-y-2">
                {documents.map((document, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(document)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{document.name}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span className="capitalize">{document.type.replace('-', ' ')}</span>
                          {document.size && (
                            <>
                              <span>•</span>
                              <span>{formatFileSize(document.size)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
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
