import React, { useState, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
  Brain,
  Loader2
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

  const handleProcessSurveys = async () => {
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
          if (targetCol && targetCol !== 'none' && row[sourceCol]) {
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-6xl overflow-hidden flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload External Survey Data
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
          {step === 'upload' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  <span>Select Survey File</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-base font-medium mb-2">Upload Survey Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload CSV or Excel files containing external survey responses
                  </p>
                  
                  <div className="flex justify-center space-x-3 mb-4">
                    <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                      Select File
                    </Button>
                    <Button size="sm" variant="outline" onClick={downloadTemplate}>
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

                <div className="bg-muted p-3 rounded-lg mt-4">
                  <h4 className="text-sm font-medium mb-2">Supported Formats:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• CSV files (.csv)</li>
                    <li>• Excel files (.xlsx, .xls)</li>
                    <li>• Maximum file size: 10MB</li>
                    <li>• Must include header row</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'mapping' && parsedData && (
            <>
              {/* Assessment Rubrics Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Brain className="h-4 w-4" />
                    <span>Assessment Rubrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground mb-3">
                    Select rubrics to automatically assess the uploaded survey data. The AI will analyze responses against each selected rubric's criteria.
                  </div>
                  <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
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
                        <div className="flex-1 min-w-0">
                          <label htmlFor={rubric.id} className="text-sm font-medium cursor-pointer">
                            {rubric.name}
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {rubric.criteria.length} criteria • {rubric.scoring_scale.maxPoints} max points
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedRubrics.length === 0 && (
                    <p className="text-yellow-600 text-xs mt-2">
                      Please select at least one rubric for assessment
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Column Mapping */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Settings className="h-4 w-4" />
                    <span>Column Mapping</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground mb-3">
                    Map your file columns to standard fields. Unmapped columns will be kept as custom fields.
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {parsedData.headers.map(header => (
                      <div key={header} className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground truncate block" title={header}>
                          {header}
                        </label>
                        <Select
                          value={columnMapping[header] || 'none'}
                          onValueChange={(value) => {
                            setColumnMapping(prev => ({
                              ...prev,
                              [header]: value
                            }));
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Map to..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Don't map</SelectItem>
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
                  <CardTitle className="text-base">Data Preview</CardTitle>
                  <Badge variant="secondary" className="w-fit">
                    {parsedData.data.length} records found
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="overflow-auto max-h-48">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-background">
                        <tr className="border-b">
                          {parsedData.headers.slice(0, 8).map(header => (
                            <th key={header} className="text-left p-1.5 font-medium min-w-0">
                              <div className="truncate" title={header}>{header}</div>
                            </th>
                          ))}
                          {parsedData.headers.length > 8 && (
                            <th className="text-left p-1.5 font-medium">...</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.data.slice(0, 5).map((row, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            {parsedData.headers.slice(0, 8).map(header => (
                              <td key={header} className="p-1.5 min-w-0">
                                <div className="truncate max-w-24" title={String(row[header] || '')}>
                                  {String(row[header] || '')}
                                </div>
                              </td>
                            ))}
                            {parsedData.headers.length > 8 && (
                              <td className="p-1.5">...</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedData.data.length > 5 && (
                      <p className="text-xs text-muted-foreground mt-2 px-1.5">
                        ... and {parsedData.data.length - 5} more rows
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {step === 'processing' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Survey Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={processing.progress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">{processing.message}</p>
                  
                  {processing.status === 'error' && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-medium text-destructive">Processing Failed</span>
                      </div>
                      <p className="text-sm text-destructive/80 mt-1">{processing.message}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mt-3"
                        onClick={() => setStep('mapping')}
                      >
                        Try Again
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'complete' && processing.results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Upload Complete</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Your external survey data has been processed and assessed with the selected rubrics.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">Records Processed</div>
                      <div className="text-xl font-bold text-primary">
                        {processing.results.total_processed || 0}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">Assessments Generated</div>
                      <div className="text-xl font-bold text-green-600">
                        {processing.results.assessments_created || 0}
                      </div>
                    </div>
                  </div>

                  {processing.results.errors && processing.results.errors.length > 0 && (
                    <div className="border border-destructive/20 rounded-lg p-3 bg-destructive/5">
                      <div className="text-sm font-medium text-destructive mb-2">Processing Errors</div>
                      <div className="max-h-24 overflow-y-auto space-y-1">
                        {processing.results.errors.slice(0, 3).map((error: any, index: number) => (
                          <div key={index} className="text-xs p-1.5 border-b border-destructive/10">
                            <span className="font-medium">Row {error.row}:</span> {error.error}
                          </div>
                        ))}
                        {processing.results.errors.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            ... and {processing.results.errors.length - 3} more errors
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-background">
          <div className="flex gap-2">
            {step === 'upload' && (
              <Button variant="outline" onClick={onClose} size="sm">
                Cancel
              </Button>
            )}
            {step === 'mapping' && (
              <Button variant="outline" onClick={() => setStep('upload')} size="sm">
                Back
              </Button>
            )}
            {step === 'complete' && (
              <Button variant="outline" onClick={() => { handleClose(); onUploadComplete(); }} size="sm">
                Close & View Results
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {step === 'mapping' && (
              <Button 
                onClick={handleProcessSurveys}
                disabled={selectedRubrics.length === 0}
                size="sm"
                className="min-w-28"
              >
                Process Data
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ExternalSurveyUploadModal;