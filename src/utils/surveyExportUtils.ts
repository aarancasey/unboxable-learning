import * as XLSX from 'xlsx';
import { createQuestionMap, getQuestionText, formatAnswer, getQuestionSection } from './surveyQuestionMapper';

export interface SurveySubmission {
  id: number;
  learner_name: string;
  learner_id?: number;
  status: string;
  responses: any;
  submitted_at: string;
}

export interface ExportOptions {
  format: 'csv' | 'excel';
  includeOnlyCompleted: boolean;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

export const exportSurveyData = async (
  submissions: SurveySubmission[],
  options: ExportOptions = { format: 'excel', includeOnlyCompleted: true }
) => {
  // Filter submissions based on options
  let filteredSubmissions = submissions;
  
  if (options.includeOnlyCompleted) {
    filteredSubmissions = submissions.filter(sub => sub.status === 'completed' || sub.status === 'approved');
  }
  
  if (options.dateRange?.start || options.dateRange?.end) {
    filteredSubmissions = filteredSubmissions.filter(sub => {
      const submissionDate = new Date(sub.submitted_at);
      const start = options.dateRange?.start ? new Date(options.dateRange.start) : null;
      const end = options.dateRange?.end ? new Date(options.dateRange.end) : null;
      
      if (start && submissionDate < start) return false;
      if (end && submissionDate > end) return false;
      return true;
    });
  }

  if (filteredSubmissions.length === 0) {
    throw new Error('No submissions found matching the selected criteria.');
  }

  // Get question mapping for consistent question text
  const questionMap = createQuestionMap();
  
  // Process data for export
  const processedData = processSubmissionsForExport(filteredSubmissions, questionMap);
  
  if (options.format === 'csv') {
    return exportAsCSV(processedData);
  } else {
    return exportAsExcel(processedData, filteredSubmissions);
  }
};

const processSubmissionsForExport = (submissions: SurveySubmission[], questionMap: any) => {
  // Collect all unique questions from all submissions
  const allQuestions = new Set<string>();
  const questionToIdMap = new Map<string, string>();
  
  submissions.forEach(submission => {
    if (submission.responses) {
      Object.entries(submission.responses).forEach(([key, value]) => {
        if (key === 'participant_info') return; // Skip participant info in questions
        
        // Handle both old format (question text as key) and new format (ID as key)
        if (typeof value === 'object' && value !== null && 'question' in value) {
          // Old format: {question: "text", answer: "value"}
          const questionText = String(value.question);
          allQuestions.add(questionText);
          questionToIdMap.set(questionText, key);
        } else {
          // New format: question ID as key, answer as value
          allQuestions.add(key);
          questionToIdMap.set(key, key);
        }
      });
    }
  });

  // Create headers
  const baseHeaders = [
    'Learner Name',
    'Submission Date', 
    'Status',
    'Participant Name',
    'Company',
    'Role',
    'Business Area'
  ];

  // Add question headers with proper section and question text
  const questionHeaders = Array.from(allQuestions).map(questionKey => {
    const questionText = getQuestionText(questionKey);
    const section = getQuestionSection(questionKey);
    return `${section}: ${questionText}`;
  });

  const headers = [...baseHeaders, ...questionHeaders];

  // Process each submission
  const rows = submissions.map(submission => {
    const row: any = {};
    
    // Basic submission info
    row['Learner Name'] = submission.learner_name || '';
    row['Submission Date'] = submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : '';
    row['Status'] = submission.status || '';
    
    // Extract participant info from various possible locations
    let participantInfo: any = {};
    if (submission.responses?.participant_info) {
      participantInfo = submission.responses.participant_info;
    } else if (submission.responses?.['Participant Information']) {
      participantInfo = submission.responses['Participant Information'];
    } else {
      // Look for participant info in response format
      Object.values(submission.responses || {}).forEach((response: any) => {
        if (typeof response === 'object' && response?.question?.includes('Participant Information')) {
          participantInfo = response.answer || {};
        }
      });
    }

    row['Participant Name'] = participantInfo?.name || '';
    row['Company'] = participantInfo?.company || '';
    row['Role'] = participantInfo?.role || '';
    row['Business Area'] = participantInfo?.businessArea || '';

    // Process answers for each question
    Array.from(allQuestions).forEach((questionKey, index) => {
      const header = questionHeaders[index];
      let answer = null;

      // Try to find the answer in different formats
      if (submission.responses?.[questionKey]) {
        const response = submission.responses[questionKey];
        if (typeof response === 'object' && response !== null && 'answer' in response) {
          answer = response.answer;
        } else {
          answer = response;
        }
      } else {
        // Try to find by question text match
        Object.entries(submission.responses || {}).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null && 'question' in value) {
            if (value.question === questionKey) {
              answer = (value as any).answer;
            }
          }
        });
      }
      
      if (answer !== undefined && answer !== null) {
        row[header] = formatAnswer(questionKey, answer);
      } else {
        row[header] = '';
      }
    });

    return row;
  });

  return { headers, rows };
};

const exportAsCSV = (data: { headers: string[]; rows: any[] }) => {
  const worksheet = XLSX.utils.json_to_sheet(data.rows, { header: data.headers });
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const filename = `survey_data_export_${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadFile(blob, filename);
  return { success: true, filename, format: 'CSV' };
};

const exportAsExcel = (data: { headers: string[]; rows: any[] }, submissions: SurveySubmission[]) => {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = createSummarySheet(submissions);
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Sheet 2: Detailed Responses
  const detailedSheet = XLSX.utils.json_to_sheet(data.rows, { header: data.headers });
  XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Detailed Responses');

  // Sheet 3: Question Reference
  const questionReference = createQuestionReferenceSheet();
  const questionSheet = XLSX.utils.json_to_sheet(questionReference);
  XLSX.utils.book_append_sheet(workbook, questionSheet, 'Question Reference');

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  const filename = `survey_data_export_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  downloadFile(blob, filename);
  return { success: true, filename, format: 'Excel' };
};

const createSummarySheet = (submissions: SurveySubmission[]) => {
  const total = submissions.length;
  const completed = submissions.filter(s => s.status === 'completed' || s.status === 'approved').length;
  const pending = submissions.filter(s => s.status === 'pending').length;
  const rejected = submissions.filter(s => s.status === 'rejected').length;

  return [
    { Metric: 'Total Submissions', Value: total },
    { Metric: 'Completed Surveys', Value: completed },
    { Metric: 'Pending Reviews', Value: pending },
    { Metric: 'Rejected Surveys', Value: rejected },
    { Metric: 'Completion Rate', Value: `${((completed / total) * 100).toFixed(1)}%` },
    { Metric: 'Export Date', Value: new Date().toLocaleString() },
    { Metric: '', Value: '' },
    { Metric: 'Recent Submissions (Last 7 Days)', Value: submissions.filter(s => {
      const submissionDate = new Date(s.submitted_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return submissionDate >= weekAgo;
    }).length }
  ];
};

const createQuestionReferenceSheet = () => {
  const questionMap = createQuestionMap();
  
  return Object.entries(questionMap).map(([id, details]) => ({
    'Question ID': id,
    'Section': details.section,
    'Question Text': details.question,
    'Question Type': details.type,
    'Options/Scale': details.options?.join('; ') || details.scaleLabels?.join('; ') || details.prompts?.join('; ') || 'N/A'
  }));
};

const downloadFile = (blob: Blob, filename: string) => {
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};