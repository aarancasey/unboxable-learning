import { ParsedUser } from './types';
import * as XLSX from 'xlsx';

export const validateUser = (user: any, rowNumber: number, existingEmails: string[]): ParsedUser => {
  const errors: string[] = [];
  
  // Required fields validation
  if (!user.name?.trim()) errors.push('Name is required');
  if (!user.email?.trim()) errors.push('Email is required');
  if (!user.role?.trim()) errors.push('Role is required');
  if (!user.team?.trim()) errors.push('Team is required');
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (user.email && !emailRegex.test(user.email)) {
    errors.push('Invalid email format');
  }
  
  // Duplicate email check
  if (existingEmails.includes(user.email?.toLowerCase())) {
    errors.push('Email already exists');
  }
  
  return {
    name: user.name?.trim() || '',
    email: user.email?.toLowerCase()?.trim() || '',
    role: user.role?.trim() || '',
    team: user.team?.trim() || '',
    isValid: errors.length === 0,
    errors,
    rowNumber
  };
};

export const parseCSV = (text: string): any[] => {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const users = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const user: any = {};
    
    headers.forEach((header, index) => {
      if (header.includes('name')) user.name = values[index];
      else if (header.includes('email')) user.email = values[index];
      else if (header.includes('role')) user.role = values[index];
      else if (header.includes('team')) user.team = values[index];
    });
    
    if (user.name || user.email) {
      users.push(user);
    }
  }
  
  return users;
};

export const parseExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        console.log('Starting Excel parse for file:', file.name);
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        console.log('Workbook loaded, sheets:', workbook.SheetNames);
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log('Raw JSON data:', jsonData);
        
        if (jsonData.length === 0) {
          console.log('No data found in Excel file');
          resolve([]);
          return;
        }
        
        const headers = (jsonData[0] as string[]).map(h => h?.toString().toLowerCase().trim());
        console.log('Parsed headers:', headers);
        const users = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue; // Skip empty rows
          
          const user: any = {};
          
          headers.forEach((header, index) => {
            const cellValue = row[index]?.toString().trim();
            if (!cellValue) return;
            
            if (header.includes('name')) user.name = cellValue;
            else if (header.includes('email')) user.email = cellValue;
            else if (header.includes('role')) user.role = cellValue;
            else if (header.includes('team')) user.team = cellValue;
          });
          
          // Only add user if they have at least name and email
          if (user.name && user.email) {
            console.log('Adding user:', user);
            users.push(user);
          }
        }
        
        console.log('Final parsed users:', users);
        resolve(users);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const downloadTemplate = () => {
  const csvContent = 'Name,Email,Role,Team\nJohn Doe,john.doe@example.com,Manager,Development\nJane Smith,jane.smith@example.com,Developer,Engineering';
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bulk_upload_template.csv';
  a.click();
  window.URL.revokeObjectURL(url);
};