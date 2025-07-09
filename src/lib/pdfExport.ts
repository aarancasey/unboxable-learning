import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (survey: any, filename: string = 'assessment') => {
  try {
    // Create a temporary container for the PDF content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '210mm'; // A4 width
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.padding = '20px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    
    // Add Unboxable branding and content
    tempDiv.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2B4A7C; padding-bottom: 20px;">
        <img src="/lovable-uploads/c8eb7e6b-35a2-4f41-a9d7-c1dd08c9b30b.png" alt="Unboxable Logo" style="height: 28px; margin-bottom: 10px;" />
        <h1 style="color: #2B4A7C; margin: 10px 0; font-size: 24px;">Leadership Assessment Summary</h1>
        <p style="color: #666; margin: 0; font-size: 14px;">Comprehensive analysis of leadership capabilities and development opportunities</p>
      </div>
      
      <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
        <h3 style="color: #2B4A7C; margin: 0 0 10px 0;">Participant Information</h3>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${survey.learner}</p>
        <p style="margin: 5px 0;"><strong>Department:</strong> ${survey.department}</p>
        <p style="margin: 5px 0;"><strong>Assessment:</strong> ${survey.title}</p>
        <p style="margin: 5px 0;"><strong>Completed:</strong> ${survey.submittedDate}</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h2 style="color: #2B4A7C; border-left: 4px solid #FF4D00; padding-left: 15px; margin-bottom: 15px;">
          1. Leadership Sentiment Snapshot
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          <div style="padding: 12px; border: 1px solid #ddd; border-radius: 6px;">
            <h4 style="color: #2B4A7C; margin: 0 0 8px 0;">Current Leadership Style</h4>
            <p style="margin: 0; background-color: #E8F0FE; padding: 8px; border-radius: 4px; font-size: 14px;">
              ${survey.aiSummary?.currentLeadershipStyle || 'Managing, but close to overload'}
            </p>
          </div>
          <div style="padding: 12px; border: 1px solid #ddd; border-radius: 6px;">
            <h4 style="color: #2B4A7C; margin: 0 0 8px 0;">Confidence Rating</h4>
            <p style="margin: 0; background-color: #E8F5E8; padding: 8px; border-radius: 4px; font-size: 14px;">
              ${survey.aiSummary?.confidenceRating || 'Developing Confidence (2.5–3.4)'}
            </p>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div style="padding: 12px; background-color: #F0F9F0; border: 1px solid #C8E6C9; border-radius: 6px;">
            <h4 style="color: #2E7D32; margin: 0 0 8px 0;">✓ Strongest Area</h4>
            <p style="margin: 0; color: #1B5E20; font-size: 14px;">
              ${survey.aiSummary?.strongestArea || 'Motivate and align your team'}
            </p>
          </div>
          <div style="padding: 12px; background-color: #FFF3E0; border: 1px solid #FFCC02; border-radius: 6px;">
            <h4 style="color: #E65100; margin: 0 0 8px 0;">→ Area to Focus On</h4>
            <p style="margin: 0; color: #BF360C; font-size: 14px;">
              ${survey.aiSummary?.focusArea || 'Lead through complexity and ambiguity'}
            </p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 25px;">
        <h2 style="color: #2B4A7C; border-left: 4px solid #2B4A7C; padding-left: 15px; margin-bottom: 15px;">
          2. Leadership Intent & Purpose
        </h2>
        <div style="margin-bottom: 15px;">
          <h4 style="color: #2B4A7C; margin: 0 0 10px 0;">Leadership Aspirations</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${(survey.aiSummary?.leadershipAspirations || ['Empowering and people-centred', 'Strategic and future-focused', 'Curious and adaptive']).map((aspiration: string) => 
              `<span style="background-color: #E8F0FE; color: #2B4A7C; padding: 6px 12px; border-radius: 20px; font-size: 13px; border: 1px solid #2B4A7C;">${aspiration}</span>`
            ).join('')}
          </div>
        </div>
        <div style="padding: 15px; background-color: #E3F2FD; border: 1px solid #90CAF9; border-radius: 6px;">
          <h4 style="color: #2B4A7C; margin: 0 0 10px 0;">Connection to Purpose Rating</h4>
          <p style="margin: 0; font-size: 16px;">
            <span style="font-size: 24px; font-weight: bold; color: #2B4A7C;">${survey.aiSummary?.purposeRating || '4'}</span>
            <span style="color: #666;"> / 6 - Connected and gaining clarity</span>
          </p>
        </div>
      </div>

      <div style="margin-bottom: 25px;">
        <h2 style="color: #2B4A7C; border-left: 4px solid #FF4D00; padding-left: 15px; margin-bottom: 15px;">
          3. Adaptive & Agile Leadership Snapshot
        </h2>
        <div style="margin-bottom: 15px;">
          <h4 style="color: #2B4A7C; margin: 0 0 10px 0;">Leadership Agility Level</h4>
          <span style="background-color: #FFF3E0; color: #FF4D00; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; border: 1px solid #FF4D00;">
            ${survey.aiSummary?.agilityLevel || 'Achiever'}
          </span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div style="padding: 15px; background-color: #F0F9F0; border: 1px solid #C8E6C9; border-radius: 6px;">
            <h4 style="color: #2E7D32; margin: 0 0 12px 0;">🌟 Notable Strengths (Top 3)</h4>
            <ul style="margin: 0; padding-left: 20px; color: #1B5E20;">
              ${(survey.aiSummary?.topStrengths || ['Action Orientation & Delivery', 'Decision-Making Agility', 'Empowering Others & Collaboration']).map((strength: string) => 
                `<li style="margin-bottom: 6px; font-size: 14px;">${strength}</li>`
              ).join('')}
            </ul>
          </div>
          <div style="padding: 15px; background-color: #FFF3E0; border: 1px solid #FFCC02; border-radius: 6px;">
            <h4 style="color: #E65100; margin: 0 0 12px 0;">🎯 Development Areas</h4>
            <ul style="margin: 0; padding-left: 20px; color: #BF360C;">
              ${(survey.aiSummary?.developmentAreas || ['Navigating Change & Uncertainty', 'Strategic Agility & Systems Thinking', 'Learning Agility & Growth Mindset']).map((area: string) => 
                `<li style="margin-bottom: 6px; font-size: 14px;">${area}</li>`
              ).join('')}
            </ul>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 25px;">
        <h2 style="color: #2B4A7C; border-left: 4px solid #666; padding-left: 15px; margin-bottom: 15px;">
          4. Overall Assessment Summary
        </h2>
        <div style="padding: 20px; background-color: #F5F5F5; border: 1px solid #DDD; border-radius: 6px;">
          <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.6;">
            ${survey.aiSummary?.overallAssessment || 'This leader demonstrates strong operational capabilities with clear areas for strategic development. Focus on building confidence in navigating ambiguity while leveraging existing strengths in team motivation and decision-making.'}
          </p>
        </div>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #2B4A7C; text-align: center; color: #666; font-size: 12px;">
        <p style="margin: 0;">Generated by Unboxable Learning Platform | ${new Date().toLocaleDateString()}</p>
        <p style="margin: 5px 0 0 0;">Confidential Leadership Assessment Report</p>
      </div>
    `;

    document.body.appendChild(tempDiv);

    // Convert to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    document.body.removeChild(tempDiv);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    // Save the PDF
    pdf.save(`${filename}-${survey.learner.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
    
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Failed to generate PDF');
  }
};