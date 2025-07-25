import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Table } from '../../components/ui';
import { studentService } from '../../services/studentService';
import { reportService, type StudentReport } from '../../services/reportService';
import { signatureService } from '../../services/signatureService';
import { ministryService } from '../../services/ministryService';
import { useAuth } from '../../hooks/useAuth';
import { Printer, Download, Eye, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PrintReportsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  const [students, setStudents] = useState<any[]>([]);
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('Term 1');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);

  const forms = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
  const sections = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    if (isAuthenticated) {
      loadStudents();
    }
  }, [isAuthenticated]);

  const loadStudents = async () => {
    try {
      const studentsData = await studentService.getAllStudents();
      setStudents(studentsData);
    } catch (error) {
      toast.error('Failed to load students');
    }
  };

  const loadReports = async () => {
    if (!selectedForm || !selectedSection) {
      toast.error('Please select both form and section');
      return;
    }

    try {
      setLoading(true);
      const reportsData = await reportService.getClassReports(
        selectedForm, 
        selectedSection, 
        selectedTerm, 
        selectedYear
      );
      
      // Filter only finalized reports
      const finalizedReports = reportsData.filter(report => report.finalized);
      setReports(finalizedReports);
      
      if (finalizedReports.length === 0) {
        toast.info('No finalized reports found for this class and term');
      }
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const { school } = useAuth();
  
  const printReport = async (studentId: number) => {
    const report = reports.find(r => r.studentId === studentId);
    if (report) {
      try {
        // Load signatures and ministry logo
        const [principalSig, classTeacherSig, ministryLogo] = await Promise.all([
          signatureService.getPrincipalSignature(),
          signatureService.getClassTeacherSignature(report.form, report.section),
          ministryService.getCurrentMinistryLogo()
        ]);
        
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Student Report - ${report.studentName}</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
                  .signatures { display: flex; justify-content: space-between; margin-top: 40px; }
                  .signature { text-align: center; }
                  .signature img { max-height: 40px; max-width: 150px; }
                </style>
              </head>
              <body>
                <div class="header">
                  <div class="logos" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div class="ministry-logo">
                      ${ministryLogo ? `<img src="http://localhost:8080${ministryLogo}" alt="Ministry Logo" style="max-height: 60px; max-width: 120px;">` : ''}
                    </div>
                    <div class="school-info" style="text-align: center; flex: 1;">
                      <h1>STUDENT PROGRESS REPORT</h1>
                      <h2>${school?.name || 'School Name'}</h2>
                    </div>
                    <div class="school-logo">
                      ${school?.logoPath ? `<img src="http://localhost:8080${school.logoPath}" alt="School Logo" style="max-height: 60px; max-width: 120px;">` : ''}
                    </div>
                  </div>
                  <div style="text-align: center;">
                    <h2>${report.studentName} - ${report.form} ${report.section}</h2>
                    <h3>${selectedTerm} ${selectedYear}</h3>
                  </div>
                </div>
                
                <h3>Subject Performance:</h3>
                <table border="1" style="width:100%; border-collapse: collapse;">
                  <tr><th>Subject</th><th>Mark</th><th>Grade</th></tr>
                  ${report.subjectReports?.map(sr => 
                    `<tr><td>${sr.subjectName}</td><td>${sr.finalMark || 0}%</td><td>${sr.finalMark >= 80 ? 'A' : sr.finalMark >= 70 ? 'B' : sr.finalMark >= 60 ? 'C' : sr.finalMark >= 50 ? 'D' : 'F'}</td></tr>`
                  ).join('') || '<tr><td colspan="3">No subjects</td></tr>'}
                </table>
                
                <h3>Overall Comment:</h3>
                <p>${report.overallComment || 'No comment provided'}</p>
                
                <div class="signatures">
                  <div class="signature">
                    ${classTeacherSig ? `<img src="http://localhost:8080${classTeacherSig.signatureUrl}" alt="Class Teacher Signature">` : '<div style="height:40px;"></div>'}
                    <div>_________________</div>
                    <div>Class Teacher</div>
                    <div>${classTeacherSig?.teacherName || ''}</div>
                  </div>
                  <div class="signature">
                    ${principalSig ? `<img src="http://localhost:8080${principalSig.signatureUrl}" alt="Principal Signature">` : '<div style="height:40px;"></div>'}
                    <div>_________________</div>
                    <div>Principal</div>
                    <div>${principalSig?.teacherName || ''}</div>
                  </div>
                </div>
                
                <button onclick="window.print()" style="margin-top: 20px;">Print Report</button>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      } catch (error) {
        toast.error('Error loading signatures');
      }
    }
  };

  const printAllReports = () => {
    if (reports.length === 0) {
      toast.error('No reports to print');
      return;
    }
    
    // Print all reports for the class
    reports.forEach((report, index) => {
      setTimeout(() => {
        printReport(report.studentId);
      }, index * 500); // Stagger the print windows
    });
  };

  const exportReports = () => {
    toast.info('Export functionality coming soon');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Print Student Reports</h1>
        <p className="text-gray-600">Print finalized student progress reports</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Form"
            value={selectedForm}
            onChange={(e) => setSelectedForm(e.target.value)}
            options={[
              { value: '', label: 'Select Form' },
              ...forms.map(form => ({ value: form, label: form }))
            ]}
          />

          <Select
            label="Section"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            options={[
              { value: '', label: 'Select Section' },
              ...sections.map(section => ({ value: section, label: section }))
            ]}
          />

          <Select
            label="Term"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            options={[
              { value: 'Term 1', label: 'Term 1' },
              { value: 'Term 2', label: 'Term 2' },
              { value: 'Term 3', label: 'Term 3' }
            ]}
          />

          <Select
            label="Academic Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            options={[
              { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() },
              { value: (new Date().getFullYear() + 1).toString(), label: (new Date().getFullYear() + 1).toString() }
            ]}
          />
        </div>
        
        <div className="mt-4 flex space-x-3">
          <Button onClick={loadReports} loading={loading}>
            <FileText className="h-4 w-4 mr-2" />
            Load Reports
          </Button>
          
          {reports.length > 0 && (
            <>
              <Button onClick={printAllReports} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print All ({reports.length})
              </Button>
              
              <Button onClick={exportReports} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Reports Table */}
      {reports.length > 0 && (
        <Card>
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">
              Finalized Reports - {selectedForm} {selectedSection} ({selectedTerm} {selectedYear})
            </h3>
          </div>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Student</Table.HeaderCell>
                <Table.HeaderCell>Subjects</Table.HeaderCell>
                <Table.HeaderCell>Overall Comment</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {reports.map((report, index) => (
                <Table.Row key={`print-report-${index}`}>
                  <Table.Cell>
                    <div className="font-medium">{report.studentName}</div>
                    <div className="text-sm text-gray-500">{report.form} {report.section}</div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm">
                      {report.subjectReports?.length || 0} subjects
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm">
                      {report.overallComment ? (
                        <span className="text-green-600">✓ Added</span>
                      ) : (
                        <span className="text-gray-400">Not added</span>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => printReport(report.studentId)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => printReport(report.studentId)}
                      >
                        <Printer className="h-3 w-3 mr-1" />
                        Print
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      )}

      {reports.length === 0 && selectedForm && selectedSection && !loading && (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Finalized Reports</h3>
          <p className="text-gray-600">
            No finalized reports found for {selectedForm} {selectedSection} in {selectedTerm} {selectedYear}.
            <br />
            Reports must be finalized by class teachers before they can be printed.
          </p>
        </Card>
      )}
    </div>
  );
};

export default PrintReportsPage;