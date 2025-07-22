import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (survey: any, filename: string = 'assessment') => {
  console.log('Starting PDF export for survey:', survey?.learner || 'Unknown');
  
  // Add validation for required survey data
  if (!survey) {
    throw new Error('Survey data is required for PDF export');
  }
  
  if (!survey.learner) {
    throw new Error('Survey learner name is required for PDF export');
  }
  
  try {
    console.log('Creating text-based PDF...');
    
    // Create PDF directly with text instead of html2canvas approach
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const lineHeight = 7;
    let yPosition = margin;
    
    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont(undefined, 'bold');
      } else {
        pdf.setFont(undefined, 'normal');
      }
      
      const textLines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      textLines.forEach((line: string) => {
        if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
      yPosition += 3; // Extra space after each section
    };
    
    // Title
    pdf.setTextColor(43, 74, 124); // Unboxable Navy
    addText('UNBOXABLE - Leadership Assessment Summary', 18, true);
    addText('Comprehensive analysis of leadership capabilities and development opportunities', 12);
    
    yPosition += 5;
    
    // Participant Information
    pdf.setTextColor(43, 74, 124);
    addText('PARTICIPANT INFORMATION', 14, true);
    pdf.setTextColor(0, 0, 0);
    addText(`Name: ${survey.learner || 'Not specified'}`);
    addText(`Department: ${survey.department || 'Not specified'}`);
    addText(`Assessment: ${survey.title || 'Leadership Assessment'}`);
    addText(`Completed: ${survey.submittedDate || new Date().toLocaleDateString()}`);
    
    yPosition += 5;
    
    // Section 1: Leadership Sentiment Snapshot
    pdf.setTextColor(43, 74, 124);
    addText('1. LEADERSHIP SENTIMENT SNAPSHOT', 14, true);
    pdf.setTextColor(0, 0, 0);
    
    addText(`Current Leadership Style: ${survey.aiSummary?.currentLeadershipStyle || 'Managing, but close to overload'}`);
    addText(`Confidence Rating: ${survey.aiSummary?.confidenceRating || 'Developing Confidence (2.5–3.4)'}`);
    addText(`Strongest Area: ${survey.aiSummary?.strongestArea || 'Motivate and align your team'}`);
    addText(`Focus Area: ${survey.aiSummary?.focusArea || 'Lead through complexity and ambiguity'}`);
    
    yPosition += 5;
    
    // Section 2: Leadership Intent & Purpose
    pdf.setTextColor(43, 74, 124);
    addText('2. LEADERSHIP INTENT & PURPOSE', 14, true);
    pdf.setTextColor(0, 0, 0);
    
    const aspirations = survey.aiSummary?.leadershipAspirations || ['Empowering and people-centred', 'Strategic and future-focused', 'Curious and adaptive'];
    addText('Leadership Aspirations:', 12, true);
    aspirations.forEach((aspiration: string) => {
      addText(`• ${aspiration}`);
    });
    
    addText(`Connection to Purpose Rating: ${survey.aiSummary?.purposeRating || 4}/6 - Connected and gaining clarity`);
    
    yPosition += 5;
    
    // Section 3: Adaptive & Agile Leadership
    pdf.setTextColor(43, 74, 124);
    addText('3. ADAPTIVE & AGILE LEADERSHIP SNAPSHOT', 14, true);
    pdf.setTextColor(0, 0, 0);
    
    addText(`Leadership Agility Level: ${survey.aiSummary?.agilityLevel || 'Achiever'}`);
    
    const strengths = survey.aiSummary?.topStrengths || ['Action Orientation & Delivery', 'Decision-Making Agility', 'Empowering Others & Collaboration'];
    addText('Notable Strengths (Top 3):', 12, true);
    strengths.forEach((strength: string) => {
      addText(`• ${strength}`);
    });
    
    const developmentAreas = survey.aiSummary?.developmentAreas || ['Navigating Change & Uncertainty', 'Strategic Agility & Systems Thinking', 'Learning Agility & Growth Mindset'];
    addText('Development Areas:', 12, true);
    developmentAreas.forEach((area: string) => {
      addText(`• ${area}`);
    });
    
    yPosition += 5;
    
    // Section 4: Overall Assessment
    pdf.setTextColor(43, 74, 124);
    addText('4. OVERALL ASSESSMENT SUMMARY', 14, true);
    pdf.setTextColor(0, 0, 0);
    
    const overallAssessment = survey.aiSummary?.overallAssessment || 'This leader demonstrates strong operational capabilities with clear areas for strategic development. Focus on building confidence in navigating ambiguity while leveraging existing strengths in team motivation and decision-making.';
    addText(overallAssessment);
    
    // Footer
    yPosition = pdf.internal.pageSize.getHeight() - 20;
    pdf.setTextColor(102, 102, 102);
    pdf.setFontSize(10);
    pdf.text(`Generated by Unboxable Learning Platform | ${new Date().toLocaleDateString()}`, margin, yPosition);
    pdf.text('Confidential Leadership Assessment Report', margin, yPosition + 5);
    
    // Save the PDF
    const pdfFilename = `${filename}-${survey.learner.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('Saving PDF:', pdfFilename);
    pdf.save(pdfFilename);
    console.log('PDF export completed successfully');
    
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};