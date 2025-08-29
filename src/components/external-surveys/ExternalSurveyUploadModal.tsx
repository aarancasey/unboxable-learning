import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRubrics } from '@/hooks/useRubrics';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Download,
  Settings,
  Brain
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExternalSurveyUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

interface ParsedData {
  headers: string[];
  data: any[];
  preview: any[];
}

const ExternalSurveyUploadModal: React.FC<ExternalSurveyUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadComplete
}) => {
  const { toast } = useToast();
  const { rubrics } = useRubrics();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'upload' | 'mapping' | 'processing' | 'complete'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [selectedRubrics, setSelectedRubrics] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState({
    status: 'idle',
    progress: 0,
    message: '',
    results: null as any
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV or Excel file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    await parseFile(selectedFile);
  };

  const parseFile = async (file: File) => {
    try {
      let data: any[];
      
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        const text = await file.text();
        data = parseCSV(text);
      } else {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      }

      if (data.length < 2) {
        throw new Error('File must contain at least a header row and one data row');
      }

      const headers = data[0] as string[];
      const rows = data.slice(1).filter(row => row.some(cell => cell !== null && cell !== ''));
      
      const parsedData: ParsedData = {
        headers,
        data: rows.map((row, index) => {
          const obj: any = { _rowIndex: index + 2 }; // +2 for header + 1-based indexing
          headers.forEach((header, i) => {
            obj[header] = row[i] || '';
          });
          return obj;
        }),
        preview: rows.slice(0, 5).map((row, index) => {
          const obj: any = { _rowIndex: index + 2 };
          headers.forEach((header, i) => {
            obj[header] = row[i] || '';
          });
          return obj;
        })
      };

      setParsedData(parsedData);
      
      // Auto-suggest column mappings
      const autoMapping: Record<string, string> = {};
      const commonMappings = [
        { patterns: ['name', 'participant', 'full_name', 'fullname'], target: 'participant_name' },
        { patterns: ['company', 'organization', 'org'], target: 'company' },
        { patterns: ['role', 'position', 'title', 'job'], target: 'role' },
        { patterns: ['date', 'submitted', 'timestamp'], target: 'date' },
        { patterns: ['email', 'e-mail'], target: 'email' }
      ];

      headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        const mapping = commonMappings.find(m => 
          m.patterns.some(pattern => lowerHeader.includes(pattern))
        );
        if (mapping) {
          autoMapping[header] = mapping.target;
        }
      });

      setColumnMapping(autoMapping);
      setStep('mapping');
      
      toast({
        title: "File Parsed Successfully",
        description: `Found ${parsedData.data.length} records with ${headers.length} columns.`
      });

    } catch (error) {
      console.error('Error parsing file:', error);
      toast({
        title: "Parse Error",
        description: error instanceof Error ? error.message : "Failed to parse file",
        variant: "destructive"
      });
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    });
  };

  const handleStartProcessing = async () => {
    if (!file || !parsedData || selectedRubrics.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one rubric before processing.",
        variant: "destructive"
      });
      return;
    }

    setStep('processing');
    setProcessing({
      status: 'uploading',
      progress: 10,
      message: 'Uploading file...',
      results: null
    });

    try {
      // Create upload record
      const { data: upload, error: uploadError } = await supabase
        .from('external_survey_uploads')
        .insert({
          filename: `external_${Date.now()}_${file.name}`,
          original_filename: file.name,
          file_size: file.size,
          content_type: file.type,
          upload_status: 'completed',
          processing_status: 'queued',
          total_records: parsedData.data.length,
          data_mapping: columnMapping
        })
        .select()
        .single();

      if (uploadError) throw uploadError;

      setProcessing(prev => ({
        ...prev,
        status: 'processing',
        progress: 30,
        message: 'Processing survey data with AI rubrics...'
      }));

      // Map data according to column mapping
      const mappedData = parsedData.data.map(row => {
        const mapped: any = {};
        Object.entries(columnMapping).forEach(([sourceCol, targetCol]) => {
          if (targetCol && row[sourceCol]) {
            mapped[targetCol] = row[sourceCol];
          }
        });
        
        // Include all unmapped columns as well
        Object.entries(row).forEach(([key, value]) => {
          if (!columnMapping[key] && key !== '_rowIndex') {
            mapped[key] = value;
          }
        });
        
        return mapped;
      });

      // Process with edge function
      const { data: result, error: processError } = await supabase.functions.invoke(
        'process-external-surveys',
        {
          body: {
            uploadId: upload.id,
            surveyData: mappedData,
            rubricIds: selectedRubrics
          }
        }
      );

      if (processError) throw processError;

      setProcessing({
        status: 'complete',
        progress: 100,
        message: 'Processing complete!',
        results: result.results
      });

      setStep('complete');

      toast({
        title: "Processing Complete",
        description: result.message
      });

    } catch (error) {
      console.error('Error processing surveys:', error);
      setProcessing({
        status: 'error',
        progress: 0,
        message: 'Processing failed',
        results: null
      });
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process surveys",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setParsedData(null);
    setSelectedRubrics([]);
    setColumnMapping({});
    setProcessing({
      status: 'idle',
      progress: 0,
      message: '',
      results: null
    });
    onClose();
  };

  const handleComplete = () => {
    handleClose();
    onUploadComplete();
  };

  const downloadTemplate = () => {
    const templateData = [
      ['participant_name', 'company', 'role', 'date', 'leadership_style', 'strengths', 'challenges', 'goals'],
      ['John Doe', 'Example Corp', 'Manager', '2024-01-15', 'Collaborative leadership approach', 'Team building, Communication', 'Time management', 'Improve strategic thinking']
    ];
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, 'Survey Template');
    XLSX.writeFile(wb, 'external_survey_template.xlsx');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload External Survey Data</span>
          </DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload Survey Data</h3>
              <p className="text-gray-600 mb-4">
                Upload CSV or Excel files containing external survey responses
              </p>
              
              <div className="flex justify-center space-x-4">
                <Button onClick={() => fileInputRef.current?.click()}>
                  Select File
                </Button>
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Supported Formats:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• CSV files (.csv)</li>
                <li>• Excel files (.xlsx, .xls)</li>
                <li>• Maximum file size: 10MB</li>
                <li>• Must include header row</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'mapping' && parsedData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Data Mapping & Configuration</h3>
              <Badge variant="secondary">
                {parsedData.data.length} records found
              </Badge>
            </div>

            {/* Rubric Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Select Assessment Rubrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rubrics.map(rubric => (
                    <div key={rubric.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={rubric.id}
                        checked={selectedRubrics.includes(rubric.id!)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRubrics(prev => [...prev, rubric.id!]);
                          } else {
                            setSelectedRubrics(prev => prev.filter(id => id !== rubric.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <label htmlFor={rubric.id} className="font-medium cursor-pointer">
                          {rubric.name}
                        </label>
                        <p className="text-sm text-gray-600 mt-1">
                          {rubric.criteria.length} criteria • {rubric.scoring_scale.maxPoints} max points
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedRubrics.length === 0 && (
                  <p className="text-yellow-600 text-sm mt-2">
                    Please select at least one rubric for assessment
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Column Mapping */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Column Mapping</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {parsedData.headers.map(header => (
                    <div key={header} className="space-y-2">
                      <label className="text-sm font-medium">{header}</label>
                      <Select
                        value={columnMapping[header] || ''}
                        onValueChange={(value) => {
                          setColumnMapping(prev => ({
                            ...prev,
                            [header]: value
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Map to..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Don't map</SelectItem>
                          <SelectItem value="participant_name">Participant Name</SelectItem>
                          <SelectItem value="company">Company</SelectItem>
                          <SelectItem value="role">Role/Position</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="custom">Keep as custom field</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Data Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {parsedData.headers.map(header => (
                          <th key={header} className="text-left p-2">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.preview.map((row, index) => (
                        <tr key={index} className="border-b">
                          {parsedData.headers.map(header => (
                            <td key={header} className="p-2 max-w-[200px] truncate">
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button 
                onClick={handleStartProcessing}
                disabled={selectedRubrics.length === 0}
              >
                Start Processing
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">Processing Survey Data</h3>
              <Progress value={processing.progress} className="w-full" />
              <p className="text-sm text-gray-600 mt-2">{processing.message}</p>
            </div>

            {processing.status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-red-800">Processing Failed</span>
                </div>
                <p className="text-red-700 mt-2">{processing.message}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setStep('mapping')}
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 'complete' && processing.results && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Processing Complete!</h3>
              <p className="text-gray-600">
                Your external survey data has been processed and assessed with the selected rubrics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {processing.results.processed}
                  </div>
                  <div className="text-sm text-gray-600">Total Processed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {processing.results.successful}
                  </div>  
                  <div className="text-sm text-gray-600">Successful</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {processing.results.failed}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </CardContent>
              </Card>
            </div>

            {processing.results.errors && processing.results.errors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Processing Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-40 overflow-y-auto">
                    {processing.results.errors.map((error: any, index: number) => (
                      <div key={index} className="text-sm p-2 border-b">
                        <span className="font-medium">Row {error.row}:</span> {error.error}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center">
              <Button onClick={handleComplete}>
                View Results in Survey Management
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExternalSurveyUploadModal;