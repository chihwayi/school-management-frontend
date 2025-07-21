import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const formatDataForExcel = <T extends Record<string, any>>(
  data: T[],
  columnMap: Record<string, string>
): Record<string, any>[] => {
  return data.map(item => {
    const formattedItem: Record<string, any> = {};
    
    Object.entries(columnMap).forEach(([key, label]) => {
      // Handle nested properties using dot notation (e.g., 'student.name')
      if (key.includes('.')) {
        const parts = key.split('.');
        let value = item;
        for (const part of parts) {
          value = value?.[part];
          if (value === undefined) break;
        }
        formattedItem[label] = value;
      } else {
        formattedItem[label] = item[key];
      }
    });
    
    return formattedItem;
  });
};