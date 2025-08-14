import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { BulkUploadModalProps, ParsedUser } from './types';
import { validateUser } from './utils';
import { FileUploadSection } from './FileUploadSection';
import { PreviewSection } from './PreviewSection';

const BulkUploadModal = ({ isOpen, onClose, onBulkImport, existingEmails }: BulkUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedUsers, setParsedUsers] = useState<ParsedUser[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const workerRef = useRef<Worker | null>(null);
  const { toast } = useToast();

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File upload triggered:', event.target.files);
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      console.log('No file selected');
      return;
    }
    
    const fileName = selectedFile.name.toLowerCase();
    
    // File type validation
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or Excel file.",
        variant: "destructive"
      });
      return;
    }

    // File size validation (limit to 10MB for mobile performance)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB for optimal performance.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('File being processed:', selectedFile.name, selectedFile.size);
    setFile(selectedFile);
    setIsProcessing(true);
    setProgress(0);
    setProgressMessage('Initializing...');
    
    // Clear the file input value to allow re-uploading the same file
    event.target.value = '';
    
    try {
      // Terminate existing worker if any
      if (workerRef.current) {
        workerRef.current.terminate();
      }

      // Create new worker
      workerRef.current = new Worker('/bulk-upload-worker.js');
      
      // Set up worker message handler
      workerRef.current.onmessage = (e) => {
        const { type, progress, message, users, error } = e.data;
        
        if (type === 'progress') {
          setProgress(progress);
          setProgressMessage(message);
        } else if (type === 'success') {
          // Process validation in chunks to avoid blocking UI
          processValidationInChunks(users);
        } else if (type === 'error') {
          throw new Error(error);
        }
      };

      // Start processing based on file type
      if (fileName.endsWith('.csv')) {
        const text = await selectedFile.text();
        workerRef.current.postMessage({
          type: 'parseCSV',
          data: { text }
        });
      } else {
        workerRef.current.postMessage({
          type: 'parseExcel',
          data: { file: selectedFile, fileName: selectedFile.name }
        });
      }
      
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error processing file",
        description: `Unable to parse the uploaded file. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      setIsProcessing(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const processValidationInChunks = async (rawUsers: any[]) => {
    setProgressMessage('Validating users...');
    
    const fileEmails = new Set();
    const validatedUsers: ParsedUser[] = [];
    const chunkSize = 25;
    
    for (let i = 0; i < rawUsers.length; i += chunkSize) {
      const chunk = rawUsers.slice(i, i + chunkSize);
      
      chunk.forEach((user, chunkIndex) => {
        const globalIndex = i + chunkIndex;
        const validated = validateUser(user, globalIndex + 2, existingEmails);
        
        // Check for duplicates within the file
        if (fileEmails.has(validated.email)) {
          validated.errors.push('Duplicate email in file');
          validated.isValid = false;
        } else if (validated.email) {
          fileEmails.add(validated.email);
        }
        
        validatedUsers.push(validated);
      });
      
      // Update progress
      const progress = Math.floor((i + chunk.length) / rawUsers.length * 100);
      setProgress(progress);
      setProgressMessage(`Validating users... ${validatedUsers.length}/${rawUsers.length}`);
      
      // Yield control to prevent UI blocking
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    
    setParsedUsers(validatedUsers);
    setStep('preview');
    setIsProcessing(false);
    setProgress(0);
    setProgressMessage('');
  };

  const handleImport = async () => {
    const validUsers = parsedUsers.filter(user => user.isValid);
    
    if (validUsers.length === 0) {
      toast({
        title: "No valid users",
        description: "Please fix the errors in your file before importing.",
        variant: "destructive"
      });
      return;
    }
    
    const newLearners = validUsers.map(user => ({
      name: user.name,
      email: user.email,
      role: user.role,
      team: user.team,
      status: 'pending',
      requires_password_change: true,
      password: Math.random().toString(36).slice(-8)
    }));
    
    try {
      console.log('Starting bulk import with learners:', newLearners);
      await onBulkImport(newLearners);
      handleClose();
    } catch (error) {
      console.error('Bulk import failed:', error);
      // Error already handled in parent component
    }
  };

  const handleClose = () => {
    // Terminate worker when closing
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    
    setFile(null);
    setParsedUsers([]);
    setStep('upload');
    setIsProcessing(false);
    setProgress(0);
    setProgressMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Users</DialogTitle>
          <DialogDescription>
            Upload multiple users at once using a CSV or Excel file
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <FileUploadSection
            onFileUpload={handleFileUpload}
            isProcessing={isProcessing}
            progress={progress}
            progressMessage={progressMessage}
          />
        )}

        {step === 'preview' && (
          <PreviewSection
            parsedUsers={parsedUsers}
            onImport={handleImport}
            onUploadDifferent={() => setStep('upload')}
            onCancel={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadModal;