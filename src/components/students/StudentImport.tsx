import React, { useState } from 'react';
import { Card, Button } from '../ui';
import { studentService } from '../../services/studentService';
import { Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StudentImport: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const downloadTemplate = async () => {
    try {
      const blob = await studentService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'student_import_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Template downloaded successfully');
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please select an Excel file (.xlsx or .xls)');
      return;
    }

    try {
      setImporting(true);
      setImportResult(null);
      const result = await studentService.importStudents(file);
      setImportResult(result);
      
      if (result.errors && result.errors.length > 0) {
        toast.error(`Import completed with ${result.errors.length} errors`);
      } else {
        toast.success(`Successfully imported ${result.successfulImports} students`);
      }
    } catch (error) {
      toast.error('Import failed');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <FileSpreadsheet className="h-6 w-6 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold">Bulk Student Import</h3>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Download the Excel template</li>
              <li>2. Fill in student information (required fields marked with *)</li>
              <li>3. Upload the completed file</li>
              <li>4. Review import results</li>
            </ol>
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Template</span>
            </Button>

            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileImport}
                className="hidden"
                id="student-import-file"
                disabled={importing}
              />
              <Button
                onClick={() => document.getElementById('student-import-file')?.click()}
                disabled={importing}
                loading={importing}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>{importing ? 'Importing...' : 'Import Students'}</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {importResult && (
        <Card className="p-6">
          <div className="flex items-center mb-4">
            {importResult.errors?.length > 0 ? (
              <AlertCircle className="h-6 w-6 text-orange-600 mr-2" />
            ) : (
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
            )}
            <h3 className="text-lg font-semibold">Import Results</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{importResult.totalRows}</div>
              <div className="text-sm text-blue-800">Total Rows</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{importResult.successfulImports}</div>
              <div className="text-sm text-green-800">Successful Imports</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{importResult.errors?.length || 0}</div>
              <div className="text-sm text-red-800">Errors</div>
            </div>
          </div>

          {importResult.errors && importResult.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">Import Errors:</h4>
              <ul className="text-sm text-red-800 space-y-1 max-h-40 overflow-y-auto">
                {importResult.errors.map((error: string, index: number) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default StudentImport;