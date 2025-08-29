import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ExternalSurveyUploadModal from './ExternalSurveyUploadModal';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Eye,
  Download,
  Trash2,
  Brain,
  BarChart3
} from 'lucide-react';
import { dateHelpers } from '@/lib/dateUtils';

interface ExternalUpload {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  upload_status: string;
  processing_status: string;
  total_records: number;
  processed_records: number;
  successful_records: number;
  failed_records: number;
  error_log: any[] | null;
  created_at: string;
  updated_at: string;
}

const ExternalSurveyManager: React.FC = () => {
  const { toast } = useToast();
  const [uploads, setUploads] = useState<ExternalUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const { data, error } = await supabase
        .from('external_survey_uploads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match our interface
      const transformedUploads = (data || []).map(upload => ({
        ...upload,
        error_log: Array.isArray(upload.error_log) ? upload.error_log : []
      }));
      
      setUploads(transformedUploads);
    } catch (error) {
      console.error('Error fetching uploads:', error);
      toast({
        title: "Error",
        description: "Failed to load external survey uploads",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUpload = async (uploadId: string) => {
    if (!confirm('Are you sure you want to delete this upload? This will also delete all associated survey submissions and assessments.')) {
      return;
    }

    try {
      // Delete rubric assessments first (cascade should handle this, but being explicit)
      await supabase
        .from('rubric_assessments')
        .delete()
        .in('survey_submission_id', 
          await supabase
            .from('survey_submissions')
            .select('id')
            .eq('external_upload_id', uploadId)
            .then(res => res.data?.map(s => s.id) || [])
        );

      // Delete survey submissions
      await supabase
        .from('survey_submissions')
        .delete()
        .eq('external_upload_id', uploadId);

      // Delete the upload record
      const { error } = await supabase
        .from('external_survey_uploads')
        .delete()
        .eq('id', uploadId);

      if (error) throw error;

      setUploads(prev => prev.filter(u => u.id !== uploadId));
      
      toast({
        title: "Upload Deleted",
        description: "External survey upload and all associated data have been deleted."
      });
    } catch (error) {
      console.error('Error deleting upload:', error);
      toast({
        title: "Error",
        description: "Failed to delete upload",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'completed_with_errors':
        return <Badge className="bg-orange-100 text-orange-800">Completed with Errors</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Brain className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'completed_with_errors':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">External Survey Management</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading external surveys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">External Survey Management</h2>
          <p className="text-gray-600">Upload and process external survey data with AI-powered rubric assessments</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload External Surveys
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{uploads.length}</div>
            <div className="text-sm text-gray-600">Total Uploads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {uploads.filter(u => u.processing_status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {uploads.filter(u => u.processing_status === 'processing').length}
            </div>
            <div className="text-sm text-gray-600">Processing</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {uploads.reduce((sum, u) => sum + u.successful_records, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Records Processed</div>
          </CardContent>
        </Card>
      </div>

      {/* Upload List */}
      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
        </CardHeader>
        <CardContent>
          {uploads.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No External Surveys Uploaded</h3>
              <p className="text-gray-600 mb-4">
                Upload CSV or Excel files containing survey responses to get started with automated assessments.
              </p>
              <Button onClick={() => setIsUploadModalOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {uploads.map(upload => (
                <div key={upload.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(upload.processing_status)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{upload.original_filename}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span>{formatFileSize(upload.file_size)}</span>
                          <span>•</span>
                          <span>{upload.total_records} records</span>
                          <span>•</span>
                          <span>Uploaded {dateHelpers.dateTime(upload.created_at)}</span>
                        </div>
                        
                        {/* Processing Progress */}
                        {upload.processing_status === 'processing' && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Processing Progress</span>
                              <span>{upload.processed_records}/{upload.total_records}</span>
                            </div>
                            <Progress 
                              value={(upload.processed_records / upload.total_records) * 100} 
                              className="h-2"
                            />
                          </div>
                        )}

                        {/* Results Summary */}
                        {(upload.processing_status === 'completed' || upload.processing_status === 'completed_with_errors') && (
                          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center p-2 bg-green-50 rounded">
                              <div className="font-medium text-green-700">{upload.successful_records}</div>
                              <div className="text-green-600">Successful</div>
                            </div>
                            <div className="text-center p-2 bg-red-50 rounded">
                              <div className="font-medium text-red-700">{upload.failed_records}</div>
                              <div className="text-red-600">Failed</div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <div className="font-medium text-gray-700">{upload.processed_records}</div>
                              <div className="text-gray-600">Total Processed</div>
                            </div>
                          </div>
                        )}

                        {/* Error Preview */}
                        {upload.error_log && upload.error_log.length > 0 && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                            <div className="flex items-center space-x-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="font-medium text-red-800">
                                {upload.error_log.length} Error{upload.error_log.length > 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="text-sm text-red-700 max-h-20 overflow-y-auto">
                              {upload.error_log.slice(0, 3).map((error, index) => (
                                <div key={index} className="mb-1">
                                  Row {error.row}: {error.error}
                                </div>
                              ))}
                              {upload.error_log.length > 3 && (
                                <div className="text-red-600">
                                  ... and {upload.error_log.length - 3} more errors
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getStatusBadge(upload.processing_status)}
                      
                      <div className="flex space-x-1">
                        {upload.successful_records > 0 && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Navigate to survey reviewer filtered by this upload
                              window.location.hash = '#surveys';
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteUpload(upload.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <ExternalSurveyUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={() => {
          fetchUploads();
          toast({
            title: "Upload Complete",
            description: "External survey data has been processed successfully."
          });
        }}
      />
    </div>
  );
};

export default ExternalSurveyManager;