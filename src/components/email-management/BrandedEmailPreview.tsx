import React from 'react';

interface BrandedEmailPreviewProps {
  subject: string;
  content: string;
  showSurveyButton?: boolean;
}

export const BrandedEmailPreview = ({ 
  subject, 
  content, 
  showSurveyButton = false 
}: BrandedEmailPreviewProps) => {
  // Replace template variables with sample data
  const processedSubject = subject
    .replace(/\{\{course_name\}\}/g, "Leadership Development Course")
    .replace(/\{\{participant_name\}\}/g, "John Smith")
    .replace(/\{\{course_start_date\}\}/g, "March 15, 2024")
    .replace(/\{\{time_until_start\}\}/g, "2 days")
    .replace(/\{\{course_duration\}\}/g, "4 weeks")
    .replace(/\{\{course_location\}\}/g, "Online");

  const processedContent = content
    .replace(/\{\{course_name\}\}/g, "Leadership Development Course")
    .replace(/\{\{participant_name\}\}/g, "John Smith")
    .replace(/\{\{course_start_date\}\}/g, "March 15, 2024")
    .replace(/\{\{time_until_start\}\}/g, "2 days")
    .replace(/\{\{course_duration\}\}/g, "4 weeks")
    .replace(/\{\{course_location\}\}/g, "Online")
    .replace(/\{\{survey_incomplete\}\}/g, "")
    .replace(/\{\{survey_link\}\}/g, "https://example.com/survey")
    // Remove HTML tags for clean preview
    .replace(/<[^>]*>/g, '')
    // Handle line breaks properly
    .replace(/&lt;br&gt;/g, '\n')
    .replace(/&lt;\/p&gt;&lt;p&gt;/g, '\n\n');

  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
      {/* Email Header with Logo */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <img 
          src="/lovable-uploads/c8eb7e6b-35a2-4f41-a9d7-c1dd08c9b30b.png" 
          alt="Unboxable" 
          className="h-8"
        />
      </div>
      
      {/* Email Subject */}
      <div className="px-6 py-3 bg-blue-50 border-b">
        <div className="text-xs text-gray-600 mb-1">Subject:</div>
        <div className="font-semibold text-gray-900">
          {processedSubject}
        </div>
      </div>
      
      {/* Email Content */}
      <div className="px-6 py-6">
        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
          {processedContent}
        </div>
        
        {/* Survey button if needed */}
        {(showSurveyButton || content.includes('survey')) && (
          <div className="mt-4">
            <button className="bg-orange-500 text-white px-6 py-2 rounded font-medium">
              Complete Survey
            </button>
          </div>
        )}
      </div>
      
      {/* Email Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t text-center">
        <p className="text-xs text-gray-600">
          Best regards,<br />
          The Unboxable Learning Team
        </p>
      </div>
    </div>
  );
};