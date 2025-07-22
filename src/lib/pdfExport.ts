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

    // Create canvas from the visual element with better options
    const canvas = await html2canvas(summaryElement, {
      scale: 1.5, // Good balance of quality and performance
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: summaryElement.offsetWidth,
      height: summaryElement.offsetHeight,
      windowWidth: summaryElement.offsetWidth,
      windowHeight: summaryElement.offsetHeight,
      x: 0,
      y: 0
    });

    // Restore action buttons
    if (actionButtons) {
      (actionButtons as HTMLElement).style.display = '';
    }
    
    // Create PDF with appropriate dimensions
    const imgData = canvas.toDataURL('image/png', 0.95);
    
    // Use A4 landscape if content is wide, portrait if tall
    const isWide = canvas.width > canvas.height;
    const pdf = new jsPDF(isWide ? 'l' : 'p', 'mm', 'a4');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    
    // Calculate dimensions to fit the content properly
    const maxWidth = pageWidth - (margin * 2);
    const maxHeight = pageHeight - (margin * 2);
    
    const widthRatio = maxWidth / canvas.width;
    const heightRatio = maxHeight / canvas.height;
    const scale = Math.min(widthRatio, heightRatio);
    
    const imgWidth = canvas.width * scale;
    const imgHeight = canvas.height * scale;
    
    // Center the image on the page
    const xOffset = (pageWidth - imgWidth) / 2;
    const yOffset = (pageHeight - imgHeight) / 2;
    
    // Add the image to PDF
    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
    
    // Add header text overlay
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`${learnerName} - Leadership Assessment`, margin, 10);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 60, 10);
    
    // Add footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text('Confidential Leadership Assessment Report', margin, pageHeight - 5);
    
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