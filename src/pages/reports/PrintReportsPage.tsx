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
  const [error, setError] = useState<string | null>(null);

  const forms = ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Form 6'];
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
      setError('Please select both form and section');
      return;
    }

    try {
      setLoading(true);
      setError(null);
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
        setError(null); // Clear any previous errors
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      setError('Unable to load reports. Please check if reports exist for the selected class and term.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const { school } = useAuth();
  
  const printReport = async (studentId: number) => {
    const report = reports.find(r => r.studentId === studentId);
    if (report) {
      try {
        console.log('Report data:', report);
        console.log('School data:', school);
        
        // Load signatures and ministry logo
        const [principalSig, classTeacherSig, ministryLogo] = await Promise.all([
          signatureService.getPrincipalSignature(),
          signatureService.getClassTeacherSignature(report.form, report.section),
          ministryService.getCurrentMinistryLogo()
        ]);
        
        console.log('Signatures loaded:', { principalSig, classTeacherSig, ministryLogo });
        
        const printWindow = window.open('', '_blank', 'width=800,height=1000');
        if (printWindow) {
          const subjectCategories = {
            'Languages & Humanities': ['English', 'Indigenous Language', 'History', 'Heritage Studies', 'Literature in English'],
            'Commercials': ['Principles of Accounting', 'Commerce', 'Business Enterprise Skills', 'Economics'],
            'Sciences': ['Mathematics', 'Combined Science', 'Biology', 'Chemistry', 'Physics', 'Geography']
          };
          
          const categorizeSubjects = (subjects) => {
            const categorized = {
              'Languages & Humanities': [],
              'Commercials': [],
              'Sciences': []
            };
            
            subjects.forEach(subject => {
              let assigned = false;
              Object.keys(subjectCategories).forEach(category => {
                if (subjectCategories[category].some(catSubject => 
                  subject.subjectName.toLowerCase().includes(catSubject.toLowerCase()) ||
                  catSubject.toLowerCase().includes(subject.subjectName.toLowerCase())
                )) {
                  categorized[category].push(subject);
                  assigned = true;
                }
              });
              // If subject doesn't match any category, put it in Sciences
              if (!assigned) {
                categorized['Sciences'].push(subject);
              }
            });
            return categorized;
          };
          
          const categorizedSubjects = categorizeSubjects(report.subjectReports || []);
          const passedSubjects = (report.subjectReports || []).filter(sr => (sr.finalMark || 0) >= 50).length;
          
          console.log('Subject reports with signatures:', report.subjectReports);
          
          printWindow.document.write(`
            <html>
              <head>
                <title>Student Monthly Progress Report - ${report.studentName}</title>
                <style>
                  body { 
                    font-family: Arial, sans-serif; 
                    margin: 15px; 
                    color: #333;
                  }
                  .header { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: flex-start; 
                    margin-bottom: 20px;
                    border-bottom: 3px solid ${school?.primaryColor || '#4B0082'};
                    padding-bottom: 15px;
                  }
                  .logo { max-height: 80px; max-width: 120px; }
                  .center-content { 
                    flex: 1; 
                    text-align: center; 
                    margin: 0 20px;
                  }
                  .school-name {
                    font-size: 22px;
                    font-weight: bold;
                    color: ${school?.primaryColor || '#4B0082'};
                    margin: 0 0 8px 0;
                    text-transform: uppercase;
                  }
                  .report-title { 
                    font-size: 16px; 
                    font-weight: bold; 
                    color: ${school?.primaryColor || '#4B0082'}; 
                    margin: 0;
                    text-transform: uppercase;
                  }
                  .student-info { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr 1fr; 
                    gap: 15px; 
                    margin: 20px 0;
                    font-size: 12px;
                  }
                  .info-field { 
                    border-bottom: 1px solid #ccc; 
                    padding: 5px 0;
                  }
                  .field-label {
                    color: ${school?.primaryColor || '#4B0082'};
                    font-weight: bold;
                  }
                  .field-value {
                    color: #333;
                    font-weight: normal;
                  }
                  .subjects-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 20px 0;
                    font-size: 9px;
                  }
                  .subjects-table th, .subjects-table td { 
                    border: 1px solid #333; 
                    padding: 3px 2px; 
                    text-align: center;
                    vertical-align: middle;
                  }
                  .subjects-table th { 
                    background-color: ${school?.primaryColor || '#4B0082'}; 
                    color: white; 
                    font-weight: bold;
                  }
                  .category-header { 
                    background-color: ${school?.secondaryColor || '#F4A460'}; 
                    font-weight: bold; 
                    text-align: left;
                    padding: 8px;
                    text-transform: uppercase;
                  }
                  .footer-section { 
                    margin-top: 30px; 
                    display: grid; 
                    grid-template-columns: 2fr 1fr; 
                    gap: 20px;
                  }
                  .comments-signatures { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 15px;
                  }
                  .comment-field, .signature-field { 
                    border-bottom: 1px solid #333; 
                    padding: 8px 0; 
                    min-height: 25px;
                  }
                  .school-stamp { 
                    border: 2px solid #333; 
                    text-align: center; 
                    padding: 15px; 
                    font-weight: bold;
                    background-color: transparent;
                    font-size: 10px;
                  }
                  .signature-img { max-height: 20px; max-width: 60px; }
                  .table-signature-img { max-height: 15px; max-width: 40px; }
                  .watermark {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0.05;
                    z-index: -1;
                    pointer-events: none;
                  }
                  @media print { 
                    body { background-image: none !important; }
                    .no-print { display: none; }
                    .watermark { opacity: 0.03; }
                  }
                </style>
              </head>
              <body>
                ${school?.backgroundPath ? `<div class="watermark"><img src="http://localhost:8080${school.backgroundPath}" style="max-width: 400px; max-height: 400px;"></div>` : ''}
                <div class="header">
                  <div>
                    ${school?.logoPath ? `<img src="http://localhost:8080${school.logoPath}" alt="School Logo" class="logo">` : '<div style="width: 120px; height: 80px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 10px;">No Logo</div>'}
                    <div style="font-size: 10px; margin-top: 5px; text-align: center; font-weight: bold;">${school?.name || 'SCHOOL NAME'}</div>
                  </div>
                  <div class="center-content">
                    <h1 class="school-name">${school?.name?.toUpperCase() || 'SCHOOL NAME'}</h1>
                    <h2 class="report-title">STUDENT'S MONTHLY PROGRESS REPORT</h2>
                  </div>
                  <div>
                    ${ministryLogo ? `<img src="http://localhost:8080${ministryLogo}" alt="Ministry Logo" class="logo">` : '<div style="width: 120px; height: 80px; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; font-size: 10px;">No Ministry Logo</div>'}
                    <div style="font-size: 9px; margin-top: 5px; text-align: center; font-weight: bold;">Ministry of Primary &<br>Secondary Education</div>
                  </div>
                </div>
                
                <div class="student-info">
                  <div class="info-field"><span class="field-label">Name of Student:</span> <span class="field-value">${report.studentName}</span></div>
                  <div class="info-field"><span class="field-label">Form:</span> <span class="field-value">${report.form} ${report.section}</span></div>
                  <div class="info-field"><span class="field-label">Subjects Recorded:</span> <span class="field-value">${(report.subjectReports || []).length}</span></div>
                  <div class="info-field"><span class="field-label">No. Passed:</span> <span class="field-value">${passedSubjects}</span></div>
                  <div class="info-field"><span class="field-label">Year:</span> <span class="field-value">${selectedYear}</span></div>
                  <div class="info-field"><span class="field-label">Month:</span> <span class="field-value">${selectedTerm}</span></div>
                </div>
                
                <table class="subjects-table">
                  <thead>
                    <tr>
                      <th rowspan="2">SUBJECT</th>
                      <th colspan="2">COURSE WORK MARK</th>
                      <th colspan="2">EXAM MARK</th>
                      <th rowspan="2">SUBJECT T'R's COMMENT</th>
                      <th rowspan="2">TEACHER'S SIGNATURE</th>
                    </tr>
                    <tr>
                      <th>%</th><th>GR</th>
                      <th>%</th><th>GR</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Object.keys(categorizedSubjects).map(category => {
                      if (categorizedSubjects[category].length === 0) return '';
                      return `
                        <tr><td colspan="7" class="category-header">${category.toUpperCase()}</td></tr>
                        ${categorizedSubjects[category].map(sr => {
                          const cwGrade = sr.courseworkMark && sr.courseworkMark >= 80 ? 'A' : sr.courseworkMark >= 70 ? 'B' : sr.courseworkMark >= 60 ? 'C' : sr.courseworkMark >= 50 ? 'D' : sr.courseworkMark ? 'F' : '-';
                          const examGrade = sr.examMark && sr.examMark >= 80 ? 'A' : sr.examMark >= 70 ? 'B' : sr.examMark >= 60 ? 'C' : sr.examMark >= 50 ? 'D' : sr.examMark ? 'F' : '-';
                          return `
                            <tr>
                              <td style="text-align: left;">${sr.subjectName}</td>
                              <td>${sr.courseworkMark !== null && sr.courseworkMark !== undefined ? Math.round(sr.courseworkMark) : '-'}</td>
                              <td>${sr.courseworkMark ? cwGrade : '-'}</td>
                              <td>${sr.examMark !== null && sr.examMark !== undefined ? Math.round(sr.examMark) : '-'}</td>
                              <td>${sr.examMark ? examGrade : '-'}</td>
                              <td style="text-align: left; font-size: 8px; max-width: 120px; word-wrap: break-word;">${sr.comment || '<span style="color: #999;">No comment</span>'}</td>
                              <td>${sr.teacherSignatureUrl ? `<img src="http://localhost:8080${sr.teacherSignatureUrl}" class="table-signature-img">` : sr.teacherId === 1 ? `<img src="http://localhost:8080/uploads/signatures/signature_1_1c6a5b6e-b180-47fc-811a-9d8779fa7d68.jpg" class="table-signature-img">` : '<span style="color: #999; font-size: 7px;">No signature</span>'}</td>
                            </tr>
                          `;
                        }).join('')}
                      `;
                    }).join('')}
                  </tbody>
                </table>
                
                <div class="footer-section">
                  <div class="comments-signatures">
                    <div class="comment-field">
                      <span class="field-label">Form Teacher's Comments:</span><br>
                      <span class="field-value" style="font-size: 10px;">${report.overallComment || ''}</span>
                    </div>
                    <div class="signature-field">
                      <span class="field-label">Form Teacher's Signature:</span>
                      ${classTeacherSig && classTeacherSig.signatureUrl ? `<img src="http://localhost:8080${classTeacherSig.signatureUrl}" class="signature-img">` : '<span style="color: #999; font-size: 9px;">No signature uploaded</span>'}
                    </div>
                    <div class="signature-field">
                      <span class="field-label">Principal's Signature:</span>
                      ${principalSig && principalSig.signatureUrl ? `<img src="http://localhost:8080${principalSig.signatureUrl}" class="signature-img">` : '<span style="color: #999; font-size: 9px;">No signature uploaded</span>'}
                    </div>
                    <div class="signature-field">
                      <span class="field-label">Parent's Signature:</span> <span style="color: #333; font-size: 10px;">___________________________</span>
                    </div>
                  </div>
                  <div class="school-stamp">
                    SCHOOL STAMP
                  </div>
                </div>
                
                <button onclick="window.print()" class="no-print" style="margin-top: 20px; padding: 10px 20px;">Print Report</button>
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

      {/* Error State */}
      {error && (
        <Card className="p-6 border-l-4 border-orange-500 bg-orange-50">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-orange-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-orange-900">Unable to Load Reports</h3>
              <p className="text-orange-700 mt-1">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* No Reports State */}
      {!error && reports.length === 0 && selectedForm && selectedSection && !loading && (
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