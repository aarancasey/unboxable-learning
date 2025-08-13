// Web Worker for bulk upload processing
importScripts('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');

self.onmessage = async function(e) {
  const { type, data } = e.data;
  
  try {
    if (type === 'parseExcel') {
      const { file, fileName } = data;
      
      // Post progress update
      self.postMessage({ type: 'progress', progress: 10, message: 'Reading file...' });
      
      const arrayBuffer = await file.arrayBuffer();
      
      self.postMessage({ type: 'progress', progress: 30, message: 'Parsing Excel data...' });
      
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      self.postMessage({ type: 'progress', progress: 50, message: 'Processing sheets...' });
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      self.postMessage({ type: 'progress', progress: 70, message: 'Converting to user data...' });
      
      if (jsonData.length === 0) {
        self.postMessage({ type: 'success', users: [] });
        return;
      }
      
      const firstRow = jsonData[0];
      const hasHeaders = firstRow.some(cell => 
        cell?.toString().toLowerCase().includes('name') ||
        cell?.toString().toLowerCase().includes('email') ||
        cell?.toString().toLowerCase().includes('role') ||
        cell?.toString().toLowerCase().includes('team')
      );
      
      let startRow = 0;
      let headers = [];
      
      if (hasHeaders) {
        headers = firstRow.map(h => h?.toString().toLowerCase().trim());
        startRow = 1;
      } else {
        headers = ['name', 'email', 'team', 'role'];
        startRow = 0;
      }
      
      const users = [];
      
      // Process in chunks to avoid blocking
      const chunkSize = 50;
      for (let chunk = 0; chunk < Math.ceil((jsonData.length - startRow) / chunkSize); chunk++) {
        const start = startRow + (chunk * chunkSize);
        const end = Math.min(start + chunkSize, jsonData.length);
        
        for (let i = start; i < end; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;
          
          const user = {};
          
          if (hasHeaders) {
            headers.forEach((header, index) => {
              const cellValue = row[index]?.toString().trim();
              if (!cellValue) return;
              
              if (header.includes('name')) user.name = cellValue;
              else if (header.includes('email')) user.email = cellValue;
              else if (header.includes('role')) user.role = cellValue;
              else if (header.includes('team')) user.team = cellValue;
            });
          } else {
            user.name = row[0]?.toString().trim();
            user.email = row[1]?.toString().trim();
            user.team = row[2]?.toString().trim();
            user.role = row[3]?.toString().trim();
          }
          
          if (user.name && user.email) {
            users.push(user);
          }
        }
        
        // Update progress
        const progress = 70 + Math.floor((chunk / Math.ceil((jsonData.length - startRow) / chunkSize)) * 25);
        self.postMessage({ 
          type: 'progress', 
          progress, 
          message: `Processing users... ${users.length} found` 
        });
        
        // Yield control periodically
        if (chunk % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }
      
      self.postMessage({ type: 'progress', progress: 100, message: 'Complete!' });
      self.postMessage({ type: 'success', users });
      
    } else if (type === 'parseCSV') {
      const { text } = data;
      
      self.postMessage({ type: 'progress', progress: 20, message: 'Parsing CSV...' });
      
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length === 0) {
        self.postMessage({ type: 'success', users: [] });
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const users = [];
      
      // Process in chunks
      const chunkSize = 100;
      for (let chunk = 0; chunk < Math.ceil((lines.length - 1) / chunkSize); chunk++) {
        const start = 1 + (chunk * chunkSize);
        const end = Math.min(start + chunkSize, lines.length);
        
        for (let i = start; i < end; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const user = {};
          
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
        
        // Update progress
        const progress = 20 + Math.floor((chunk / Math.ceil((lines.length - 1) / chunkSize)) * 60);
        self.postMessage({ 
          type: 'progress', 
          progress, 
          message: `Processing CSV... ${users.length} users found` 
        });
        
        // Yield control
        if (chunk % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }
      
      self.postMessage({ type: 'progress', progress: 100, message: 'Complete!' });
      self.postMessage({ type: 'success', users });
    }
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
};