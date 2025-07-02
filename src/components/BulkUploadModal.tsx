import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Download, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkImport: (learners: any[]) => void;
  existingEmails: string[];
}

interface ParsedUser {
  name: string;
  email: string;
  mobile: string;
  department: string;
  isValid: boolean;
  errors: string[];
  rowNumber: number;
}

const BulkUploadModal = ({ isOpen, onClose, onBulkImport, existingEmails }: BulkUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedUsers, setParsedUsers] = useState<ParsedUser[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'confirm'>('upload');
  const { toast } = useToast();

  const validateUser = (user: any, rowNumber: number): ParsedUser => {
    const errors: string[] = [];
    
    // Required fields validation
    if (!user.name?.trim()) errors.push('Name is required');
    if (!user.email?.trim()) errors.push('Email is required');
    if (!user.mobile?.trim()) errors.push('Mobile is required');
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (user.email && !emailRegex.test(user.email)) {
      errors.push('Invalid email format');
    }
    
    // Duplicate email check
    if (existingEmails.includes(user.email?.toLowerCase())) {
      errors.push('Email already exists');
    }
    
    return {
      name: user.name?.trim() || '',
      email: user.email?.toLowerCase()?.trim() || '',
      mobile: user.mobile?.trim() || '',
      department: user.department?.trim() || '',
      isValid: errors.length === 0,
      errors,
      rowNumber
    };
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const users = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const user: any = {};
      
      headers.forEach((header, index) => {
        if (header.includes('name')) user.name = values[index];
        else if (header.includes('email')) user.email = values[index];
        else if (header.includes('mobile') || header.includes('phone')) user.mobile = values[index];
        else if (header.includes('department')) user.department = values[index];
      });
      
      if (user.name || user.email) {
        users.push(user);
      }
    }
    
    return users;
  };

  const parseExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            resolve([]);
            return;
          }
          
          const headers = (jsonData[0] as string[]).map(h => h.toLowerCase());
          const users = [];
          
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            const user: any = {};
            
            headers.forEach((header, index) => {
              if (header.includes('name')) user.name = row[index];
              else if (header.includes('email')) user.email = row[index];
              else if (header.includes('mobile') || header.includes('phone')) user.mobile = row[index];
              else if (header.includes('department')) user.department = row[index];
            });
            
            if (user.name || user.email) {
              users.push(user);
            }
          }
          
          resolve(users);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

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
      let rawUsers: any[] = [];
      
      if (fileName.endsWith('.csv')) {
        const text = await selectedFile.text();
        rawUsers = parseCSV(text);
      } else {
        rawUsers = await parseExcel(selectedFile);
      }
      
      // Validate users and check for duplicates within the file
      const fileEmails = new Set();
      const validatedUsers = rawUsers.map((user, index) => {
        const validated = validateUser(user, index + 2); // +2 because row 1 is headers and we start from 0
        
        // Check for duplicates within the file
        if (fileEmails.has(validated.email)) {
          validated.errors.push('Duplicate email in file');
          validated.isValid = false;
        } else if (validated.email) {
          fileEmails.add(validated.email);
        }
        
        return validated;
      });
      
      setParsedUsers(validatedUsers);
      setStep('preview');
    } catch (error) {
      toast({
        title: "Error processing file",
        description: "Unable to parse the uploaded file. Please check the format.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'Name,Email,Mobile,Department\nJohn Doe,john.doe@example.com,+1234567890,Engineering\nJane Smith,jane.smith@example.com,+0987654321,Marketing';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const validUsers = parsedUsers.filter(user => user.isValid);
    
    const newLearners = validUsers.map((user, index) => ({
      id: Date.now() + index,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      department: user.department || 'General',
      status: 'pending',
      enrolledDate: new Date().toISOString().split('T')[0],
      requiresPasswordChange: true,
      tempPassword: Math.random().toString(36).slice(-8)
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

  const validCount = parsedUsers.filter(user => user.isValid).length;
  const invalidCount = parsedUsers.length - validCount;

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
          <div className="space-y-6">
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
                        onChange={handleFileUpload}
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
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {validCount} Valid
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    {invalidCount} Invalid
                  </Badge>
                )}
              </div>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Upload Different File
              </Button>
            </div>

            {invalidCount > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {invalidCount} users have validation errors and will be skipped during import.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedUsers.map((user, index) => (
                      <TableRow key={index} className={!user.isValid ? 'bg-red-50' : ''}>
                        <TableCell>{user.rowNumber}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.mobile}</TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>
                          {user.isValid ? (
                            <Badge variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Valid
                            </Badge>
                          ) : (
                            <div className="space-y-1">
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Invalid
                              </Badge>
                              <div className="text-xs text-red-600">
                                {user.errors.join(', ')}
                              </div>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleImport}
                disabled={validCount === 0}
              >
                Import {validCount} Users
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadModal;