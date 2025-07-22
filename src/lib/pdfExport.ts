import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (survey: any, filename: string = 'assessment') => {
  console.log('Starting PDF export for survey:', survey);
  
  // Add validation for required survey data
  if (!survey) {
    throw new Error('Survey data is required for PDF export');
  }
  
  // Handle both old (learner) and new (learner_name) field formats
  const learnerName = survey.learner || survey.learner_name;
  if (!learnerName) {
    throw new Error('Survey learner name is required for PDF export');
  }

  try {
    console.log('Capturing visual layout for PDF...');
    
    // Find the AI summary container element
    const summaryElement = document.querySelector('[data-pdf-export]') || 
                          document.querySelector('.max-w-5xl') ||
                          document.body;
    
    if (!summaryElement) {
      throw new Error('Could not find summary element to export');
    }

    // Create canvas from the visual element
    const canvas = await html2canvas(summaryElement as HTMLElement, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: summaryElement.scrollWidth,
      height: summaryElement.scrollHeight,
      scrollX: 0,
      scrollY: 0
    });
    
    // Create PDF with appropriate dimensions
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    
    // Calculate image dimensions to fit page
    const imgWidth = pageWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add header with logo and title
    pdf.setFillColor(240, 248, 255); // Light blue background
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    // Add logo area (placeholder for now)
    pdf.setFontSize(16);
    pdf.setTextColor(43, 74, 124); // Unboxable navy
    pdf.setFont(undefined, 'bold');
    pdf.text('unboxable.', margin, 20);
    
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text('AI Leadership Assessment Summary', margin, 30);
    
    // Add learner name and date
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Learner: ${learnerName}`, pageWidth - 80, 20);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 80, 30);
    
    let currentY = 50;
    
    // If the image is too tall for one page, split it
    if (imgHeight > pageHeight - currentY - margin) {
      // Calculate how much of the image fits on first page
      const availableHeight = pageHeight - currentY - margin;
      const firstPageImgHeight = availableHeight;
      const firstPageCanvasHeight = (firstPageImgHeight * canvas.width) / imgWidth;
      
      // Create canvas for first page
      const firstPageCanvas = document.createElement('canvas');
      firstPageCanvas.width = canvas.width;
      firstPageCanvas.height = firstPageCanvasHeight;
      const firstPageCtx = firstPageCanvas.getContext('2d');
      
      if (firstPageCtx) {
        firstPageCtx.drawImage(canvas, 0, 0, canvas.width, firstPageCanvasHeight, 0, 0, canvas.width, firstPageCanvasHeight);
        const firstPageImgData = firstPageCanvas.toDataURL('image/png');
        pdf.addImage(firstPageImgData, 'PNG', margin, currentY, imgWidth, firstPageImgHeight);
      }
      
      // Add remaining content on new pages
      let remainingHeight = canvas.height - firstPageCanvasHeight;
      let sourceY = firstPageCanvasHeight;
      
      while (remainingHeight > 0) {
        pdf.addPage();
        
        const pageAvailableHeight = pageHeight - (margin * 2);
        const currentPageHeight = Math.min(remainingHeight, (pageAvailableHeight * canvas.width) / imgWidth);
        
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = currentPageHeight;
        const pageCtx = pageCanvas.getContext('2d');
        
        if (pageCtx) {
          pageCtx.drawImage(canvas, 0, sourceY, canvas.width, currentPageHeight, 0, 0, canvas.width, currentPageHeight);
          const pageImgData = pageCanvas.toDataURL('image/png');
          const pageImgHeight = (currentPageHeight * imgWidth) / canvas.width;
          pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, pageImgHeight);
        }
        
        remainingHeight -= currentPageHeight;
        sourceY += currentPageHeight;
      }
    } else {
      // Image fits on single page
      pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
    }
    
    // Add footer to all pages
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Confidential Leadership Assessment Report', margin, pageHeight - 10);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
    }
    
    // Save the PDF
    const pdfFilename = `${filename}-${learnerName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('Saving PDF:', pdfFilename);
    pdf.save(pdfFilename);
    console.log('PDF export completed successfully');
    
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};