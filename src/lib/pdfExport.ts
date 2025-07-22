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
    const summaryElement = document.querySelector('[data-pdf-export]') as HTMLElement;
    
    if (!summaryElement) {
      throw new Error('Could not find summary element to export');
    }

    // Temporarily hide action buttons during capture
    const actionButtons = summaryElement.querySelector('.border-t.border-border');
    if (actionButtons) {
      (actionButtons as HTMLElement).style.display = 'none';
    }

    // Wait a moment for layout to stabilize
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create canvas from the visual element with better options
    const canvas = await html2canvas(summaryElement, {
      scale: 2, // Higher resolution for crisp text
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: summaryElement.scrollWidth,
      height: summaryElement.scrollHeight,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    });

    // Restore action buttons
    if (actionButtons) {
      (actionButtons as HTMLElement).style.display = '';
    }

    // Create PDF - always use portrait for better readability
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/png', 0.98);
    
    // Calculate scaling to use most of the page width
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // If content fits on one page
    if (imgHeight <= contentHeight) {
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    } else {
      // Content needs multiple pages
      const pagesNeeded = Math.ceil(imgHeight / contentHeight);
      const pageContentHeight = canvas.height / pagesNeeded;
      
      for (let page = 0; page < pagesNeeded; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        // Create a canvas for this page section
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageContentHeight;
        const pageCtx = pageCanvas.getContext('2d');
        
        if (pageCtx) {
          // Draw the portion of the original canvas for this page
          pageCtx.drawImage(
            canvas,
            0, page * pageContentHeight, // source x, y
            canvas.width, pageContentHeight, // source width, height
            0, 0, // destination x, y
            canvas.width, pageContentHeight // destination width, height
          );
          
          const pageImgData = pageCanvas.toDataURL('image/png', 0.98);
          const pageImgHeight = (pageContentHeight * imgWidth) / canvas.width;
          
          pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, pageImgHeight);
        }
      }
    }
    
    // Add minimal footer
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`${learnerName} - Leadership Assessment (${new Date().toLocaleDateString()})`, margin, pageHeight - 5);
      if (totalPages > 1) {
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 5);
      }
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