import React, { useState, useEffect } from 'react';
import { useAuth, useRoleCheck } from '../../hooks/useAuth';
import { reportService, type StudentReport } from '../../services/reportService';
import { teacherService } from '../../services/teacherService';
import { Card, Button, Select, Table, Modal, Input } from '../../components/ui';
import ReportingGuide from '../../components/reports/ReportingGuide';
import { MessageSquare, CheckCircle, FileText, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReportsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isClassTeacher, canAddSubjectComments, canAddOverallComments } = useRoleCheck();
  
  // Helper function to check if teacher can comment on a specific subject
  const canCommentOnSubject = (subjectId: number) => {
    return teacherAssignments.some(assignment => assignment.subjectId === subjectId);
  };
  
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<any[]>([]);
  const [supervisedClasses, setSupervisedClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('Term 1');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isOverallModalOpen, setIsOverallModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<StudentReport | null>(null);
  const [selectedSubjectReport, setSelectedSubjectReport] = useState<any>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadTeacherData();
    }
  }, [isAuthenticated]);

  const loadTeacherData = async () => {
    try {
      const [assignments, classes] = await Promise.all([
        teacherService.getAssignedSubjectsAndClasses(),
        isClassTeacher() ? teacherService.getSupervisedClasses() : Promise.resolve([])
      ]);
      setTeacherAssignments(assignments);
      setSupervisedClasses(classes);
    } catch (error) {
      toast.error('Failed to load teacher data');
    }
  };

  const loadReports = async () => {
    if (!selectedTerm || !selectedYear) return;
    
    try {
      setLoading(true);
      let reportsData: StudentReport[] = [];

      if (selectedClass && isClassTeacher()) {
        // Load class reports for class teacher
        const [form, section] = selectedClass.split('-');
        reportsData = await reportService.getClassReports(form, section, selectedTerm, selectedYear);
      } else if (selectedSubject) {
        // Load subject reports for regular teacher
        const assignment = teacherAssignments.find(a => a.id.toString() === selectedSubject);
        if (assignment) {
          reportsData = await reportService.getSubjectReports(
            assignment.subjectId, 
            assignment.form, 
            assignment.section, 
            selectedTerm, 
            selectedYear
          );
        }
      }

      setReports(reportsData);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectComment = (report: StudentReport, subjectReport: any) => {
    setSelectedReport(report);
    setSelectedSubjectReport(subjectReport);
    setComment(subjectReport.comment || '');
    setIsCommentModalOpen(true);
  };

  const handleOverallComment = (report: StudentReport) => {
    setSelectedReport(report);
    setComment(report.overallComment || '');
    setIsOverallModalOpen(true);
  };

  const saveSubjectComment = async () => {
    if (!selectedReport || !selectedSubjectReport) return;

    try {
      await reportService.addSubjectComment({
        reportId: selectedReport.id,
        subjectId: selectedSubjectReport.subjectId,
        comment
      });
      toast.success('Subject comment saved');
      setIsCommentModalOpen(false);
      loadReports();
    } catch (error) {
      toast.error('Failed to save comment');
    }
  };

  const saveOverallComment = async () => {
    if (!selectedReport) return;

    try {
      await reportService.addOverallComment({
        reportId: selectedReport.id,
        comment
      });
      toast.success('Overall comment saved');
      setIsOverallModalOpen(false);
      loadReports();
    } catch (error) {
      toast.error('Failed to save comment');
    }
  };

  const finalizeReport = async (reportId: number) => {
    if (!window.confirm('Are you sure you want to finalize this report? This action cannot be undone.')) return;

    try {
      await reportService.finalizeReport(reportId);
      toast.success('Report finalized');
      loadReports();
    } catch (error) {
      toast.error('Failed to finalize report');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Reports</h1>
        <p className="text-gray-600">Manage student reports and add comments</p>
      </div>

      {/* Guide */}
      <ReportingGuide />

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {isClassTeacher() && supervisedClasses.length > 0 && (
            <Select
              label="Supervised Class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              options={[
                { value: '', label: 'Select Supervised Class' },
                ...supervisedClasses.map(cls => ({
                  value: `${cls.form}-${cls.section}`,
                  label: `${cls.form} ${cls.section} (${cls.studentCount || 0} students)`
                }))
              ]}
            />
          )}
          
          {teacherAssignments.length > 0 && (
            <Select
              label="Teaching Subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              options={[
                { value: '', label: 'Select Teaching Subject' },
                ...teacherAssignments.map(assignment => ({
                  value: assignment.id.toString(),
                  label: `${assignment.subjectName} - ${assignment.form} ${assignment.section}`
                }))
              ]}
            />
          )}

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
        
        <div className="mt-4">
          <Button onClick={loadReports} loading={loading}>
            Load Reports
          </Button>
        </div>
      </Card>

      {/* Reports Table */}
      {reports.length > 0 && (
        <Card>
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Student Reports</h3>
          </div>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Student</Table.HeaderCell>
                <Table.HeaderCell>Subjects</Table.HeaderCell>
                <Table.HeaderCell>Overall Comment</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {reports.map((report, reportIndex) => (
                <Table.Row key={`report-${reportIndex}`}>
                  <Table.Cell>
                    <div className="font-medium">{report.studentName}</div>
                    <div className="text-sm text-gray-500">{report.form} {report.section}</div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="space-y-1">
                      {report.subjectReports && report.subjectReports.length > 0 ? (
                        report.subjectReports.map((subjectReport, index) => (
                          <div key={`subject-${reportIndex}-${index}`} className="flex items-center justify-between text-sm">
                            <span>{subjectReport.subjectName || 'Unknown Subject'}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600">
                                {subjectReport.finalMark ? `${subjectReport.finalMark}%` : 'No marks'}
                              </span>
                              {canAddSubjectComments() && canCommentOnSubject(subjectReport.subjectId) && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSubjectComment(report, subjectReport)}
                                  className={subjectReport.comment ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}
                                  title={subjectReport.comment ? 'Comment added - click to edit' : 'Add subject comment'}
                                >
                                  <MessageSquare className={`h-3 w-3 ${subjectReport.comment ? 'fill-current' : ''}`} />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No subjects assigned</div>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm">
                      {report.overallComment ? (
                        <span className="text-green-600">Added</span>
                      ) : (
                        <span className="text-gray-400">Not added</span>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {report.finalized ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Finalized
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        Draft
                      </span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      {canAddOverallComments() && !report.finalized && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOverallComment(report)}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Overall Comment
                        </Button>
                      )}
                      {canAddOverallComments() && !report.finalized && (
                        <Button
                          size="sm"
                          onClick={() => finalizeReport(report.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Finalize
                        </Button>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      )}

      {/* Subject Comment Modal */}
      <Modal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        title="Add Subject Comment"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">
              Student: {selectedReport?.studentName}
            </p>
            <p className="text-sm text-gray-600">
              Subject: {selectedSubjectReport?.subjectName}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your comment for this subject..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsCommentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveSubjectComment}>
              Save Comment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Overall Comment Modal */}
      <Modal
        isOpen={isOverallModalOpen}
        onClose={() => setIsOverallModalOpen(false)}
        title="Add Overall Comment"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">
              Student: {selectedReport?.studentName}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Overall Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter overall comment for this student..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsOverallModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveOverallComment}>
              Save Comment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReportsPage;