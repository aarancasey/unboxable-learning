export interface ParsedUser {
  name: string;
  email: string;
  isValid: boolean;
  errors: string[];
  rowNumber: number;
}

export interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkImport: (learners: any[]) => void;
  existingEmails: string[];
}