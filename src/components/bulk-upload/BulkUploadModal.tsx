import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { BulkUploadModalProps, ParsedUser } from './types';
import { validateUser, parseCSV, parseExcel } from './utils';
import { FileUploadSection } from './FileUploadSection';
import { PreviewSection } from './PreviewSection';

const BulkUploadModal = ({ isOpen, onClose, onBulkImport, existingEmails }: BulkUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedUsers, setParsedUsers] = useState<ParsedUser[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    
    const fileType = selectedFile.type;
    const fileName = selectedFile.name.toLowerCase();
    
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or Excel file.",
        variant: "destructive"
      });
      return;
    }
    
    setFile(selectedFile);
    setIsProcessing(true);
    
    try {
      console.log('Processing file:', selectedFile.name, 'Type:', selectedFile.type);
      let rawUsers: any[] = [];
      
      if (fileName.endsWith('.csv')) {
        console.log('Parsing as CSV');
        const text = await selectedFile.text();
        rawUsers = parseCSV(text);
      } else {
        console.log('Parsing as Excel');
        rawUsers = await parseExcel(selectedFile);
      }
      
      console.log('Raw users from parser:', rawUsers);
      
      // Validate users and check for duplicates within the file
      const fileEmails = new Set();
      const validatedUsers = rawUsers.map((user, index) => {
        const validated = validateUser(user, index + 2, existingEmails); // +2 because row 1 is headers and we start from 0
        
        // Check for duplicates within the file
        if (fileEmails.has(validated.email)) {
          validated.errors.push('Duplicate email in file');
          validated.isValid = false;
        } else if (validated.email) {
          fileEmails.add(validated.email);
        }
        
        return validated;
      });
      
      console.log('Validated users:', validatedUsers);
      setParsedUsers(validatedUsers);
      setStep('preview');
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error processing file",
        description: `Unable to parse the uploaded file. Please check the format. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    const validUsers = parsedUsers.filter(user => user.isValid);
    
    const newLearners = validUsers.map((user, index) => ({
      id: Date.now() + index,
      name: user.name,
      email: user.email,
      role: user.role,
      team: user.team,
      status: 'pending',
      requires_password_change: true,
      password: Math.random().toString(36).slice(-8)
    }));
    
    onBulkImport(newLearners);
    
    toast({
      title: "Bulk import successful",
      description: `Successfully imported ${validUsers.length} learners.`,
    });
    
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setParsedUsers([]);
    setStep('upload');
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