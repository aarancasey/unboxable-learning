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
import { autoMapColumns, getSurveyQuestionMappings } from '@/utils/surveyAutoMapping';
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
      
      // Use intelligent auto-mapping system
      const autoMapping = autoMapColumns(headers);
      setColumnMapping(autoMapping);
      
      const mappedCount = Object.keys(autoMapping).length;
      const totalColumns = headers.length;
      
      setStep('mapping');
      
      toast({
        title: "File Parsed Successfully",
        description: `Found ${parsedData.data.length} records with ${headers.length} columns. Auto-mapped ${mappedCount}/${totalColumns} columns.`
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
      <SheetContent side="right" className="w-full sm:max-w-7xl overflow-hidden flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload External Survey Data
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
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

              {/* Data Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    <span>Data Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground mb-3">
                    Preview of how your data will be processed. Check for any formatting issues.
                  </div>
                  <div className="overflow-x-auto">
                    <table className="text-xs border-collapse border border-border w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border p-2 text-left">Name</th>
                          <th className="border border-border p-2 text-left">Email</th>
                          <th className="border border-border p-2 text-left">Role</th>
                          <th className="border border-border p-2 text-left">Department</th>
                          <th className="border border-border p-2 text-left">Sample Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.preview.slice(0, 3).map((row, index) => (
                          <tr key={index}>
                            <td className="border border-border p-2">{row.participant_name || row.name || 'N/A'}</td>
                            <td className="border border-border p-2">{row.email || 'N/A'}</td>
                            <td className="border border-border p-2">{row.role || 'N/A'}</td>
                            <td className="border border-border p-2">{row.department || 'N/A'}</td>
                            <td className="border border-border p-2 truncate max-w-32">
                              {Object.keys(row).slice(0, 3).map(key => `${key}: ${row[key]}`).join(', ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">
                        Map your file columns to standard fields. Auto-mapped fields are based on intelligent text matching.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const autoMapping = autoMapColumns(parsedData.headers);
                          setColumnMapping(autoMapping);
                          const mappedCount = Object.keys(autoMapping).length;
                          toast({
                            title: "Re-mapped Columns",
                            description: `Auto-mapped ${mappedCount}/${parsedData.headers.length} columns using intelligent matching.`
                          });
                        }}
                      >
                        Re-run Auto-mapping
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {parsedData.headers.map(header => (
                      <div key={header} className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-medium text-muted-foreground truncate" title={header}>
                            {header}
                          </label>
                          {columnMapping[header] && columnMapping[header] !== 'none' && (
                            <Badge variant="secondary" className="text-xs">Auto-mapped</Badge>
                          )}
                        </div>
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
                          <SelectContent className="max-h-64 overflow-y-auto">
                            <SelectItem value="none">Don't map</SelectItem>
                            
                            {/* Basic Info */}
                            <SelectItem value="participant_name">Participant Name</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="role">Role/Position</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="department">Department</SelectItem>
                            <SelectItem value="employment_length">Employment Length</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            
                            {/* Leadership Sentiment */}
                            <SelectItem value="sentiment_1">Current Leadership Style</SelectItem>
                            <SelectItem value="sentiment_2">Confidence in Leadership Abilities</SelectItem>
                            <SelectItem value="sentiment_3">Leadership Mindset</SelectItem>
                            <SelectItem value="sentiment_4">Most Challenging</SelectItem>
                            <SelectItem value="sentiment_5">Most Exciting/Energising</SelectItem>
                            <SelectItem value="sentiment_6">What Matters Most to You as a Leader</SelectItem>
                            
                            {/* Purpose */}
                            <SelectItem value="purpose_5">Purpose Rating</SelectItem>
                            
                            {/* Agility */}
                            <SelectItem value="agility_1">Decision Making</SelectItem>
                            <SelectItem value="agility_2">Complex Problem Solving</SelectItem>
                            <SelectItem value="agility_3">Team Dynamics</SelectItem>
                            <SelectItem value="agility_4">Change Leadership</SelectItem>
                            <SelectItem value="agility_5">Learning & Experimentation</SelectItem>
                            <SelectItem value="agility_6">Stakeholder Management</SelectItem>
                            
                            {/* Leadership Competencies */}
                            <SelectItem value="communication_skills">Communication Skills</SelectItem>
                            <SelectItem value="emotional_intelligence">Emotional Intelligence</SelectItem>
                            <SelectItem value="strategic_thinking">Strategic Thinking</SelectItem>
                            <SelectItem value="innovation_capability">Innovation Capability</SelectItem>
                            <SelectItem value="conflict_management">Conflict Management</SelectItem>
                            <SelectItem value="coaching_capability">Coaching Capability</SelectItem>
                            <SelectItem value="influence_skills">Influence Skills</SelectItem>
                            
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
                <CardContent className="space-y-4">
                  <div className="text-xs text-muted-foreground">
                    Preview of your data with current column mappings. Scroll horizontally to see all columns.
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            {parsedData.headers.map(header => {
                              const mappedTo = columnMapping[header];
                              return (
                                <th key={header} className="text-left p-3 font-medium border-r last:border-r-0 min-w-32">
                                  <div className="space-y-1">
                                    <div className="font-medium truncate" title={header}>
                                      {header}
                                    </div>
                                    {mappedTo && mappedTo !== 'none' && (
                                      <Badge variant="secondary" className="text-xs">
                                        → {mappedTo.replace(/_/g, ' ')}
                                      </Badge>
                                    )}
                                  </div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {parsedData.preview.map((row, index) => (
                            <tr key={index} className="border-b hover:bg-muted/30">
                              {parsedData.headers.map(header => (
                                <td key={header} className="p-3 border-r last:border-r-0 min-w-32">
                                  <div className="max-w-48 truncate" title={row[header]}>
                                    {row[header] || '-'}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {parsedData.data.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      Showing first 5 rows of {parsedData.data.length} total records
                    </p>
                  )}
                  
                  <div className="flex gap-2 pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      <strong>Mapped fields:</strong> {Object.values(columnMapping).filter(v => v && v !== 'none').length} of {parsedData.headers.length}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Processing Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t bg-background sticky bottom-0">
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setStep('upload')}>
                    Back to Upload
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    {Object.values(columnMapping).filter(v => v && v !== 'none').length} fields mapped
                  </div>
                </div>
                <Button 
                  onClick={handleProcessSurveys} 
                  disabled={selectedRubrics.length === 0}
                  className="font-medium"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Process with AI Assessment ({selectedRubrics.length} rubric{selectedRubrics.length !== 1 ? 's' : ''})
                </Button>
              </div>
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