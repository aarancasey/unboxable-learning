import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Download, X } from 'lucide-react';
import { exportToPDF } from '@/lib/pdfExport';
import { useToast } from '@/hooks/use-toast';

interface PDFPreviewModalProps {
  survey: any;
  trigger?: React.ReactNode;
}

export const PDFPreviewModal = ({ survey, trigger }: PDFPreviewModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportToPDF(survey, 'leadership-assessment');
      toast({
        title: "Export Successful",
        description: "Leadership assessment has been exported to PDF.",
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Clone the original element content for preview
  useEffect(() => {
    if (isOpen && previewRef.current) {
      const originalElement = document.querySelector('[data-pdf-export]');
      if (originalElement) {
        // Clone the content but with a different background for preview
        previewRef.current.innerHTML = originalElement.innerHTML;
        
        // Hide action buttons in preview
        const actionButtons = previewRef.current.querySelector('.border-t.border-border');
        if (actionButtons) {
          (actionButtons as HTMLElement).style.display = 'none';
        }
      }
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview PDF
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            PDF Preview
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {/* PDF Preview Container */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="bg-white shadow-lg mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
              {/* This simulates A4 dimensions */}
              <div 
                ref={previewRef}
                className="w-full p-6 text-sm"
                style={{ 
                  transform: 'scale(0.7)', 
                  transformOrigin: 'top left',
                  width: '142.8%' // Compensate for scale
                }}
              >
                {/* Content will be populated by useEffect */}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            This is how your PDF will look when downloaded
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button onClick={handleExportPDF} disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Download PDF'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};