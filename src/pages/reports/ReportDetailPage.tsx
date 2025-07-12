import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useRoleCheck } from '../../hooks/useAuth';
import { reportService } from '../../services/reportService';
import { teacherService } from '../../services/teacherService';
import type { Report, SubjectReport, TeacherSubjectClass } from '../../types';
import { Card, Button, Badge, Modal } from '../../components/ui';
import { ReportCommentForm } from '../../components/forms';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  BookOpen, 
  Edit, 
  Check, 
  MessageSquare,
  FileText,
  Download,
  Clock,
  Award
} from 'lucide-react';

const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    canAddSubjectComments, 
    canAddOverallComments, 
    canFinalizeReports, 
    isTeacher, 
    isClassTeacher 
  } = useRoleCheck();

  // State management
  const [report, setReport] = useState<Report | null>(null);
  const [assignedSubjects, setAssignedSubjects] = useState<TeacherSubjectClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectReport | null>(null);
  const [showOverallCommentModal, setShowOverallCommentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadReport();
      if (isTeacher()) {
        loadAssignedSubjects();
      }
    }
  }, [id]);

  const loadReport = async () => {
    try {
      setIsLoading(true);
      const reportData = await reportService.getReportById(parseInt(id!));
      setReport(reportData);
    } catch (error) {
      console.error('Error loading report:', error);
      toast.error('Failed to load report');
      navigate('/reports');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAssignedSubjects = async () => {
    try {
      const subjects = await teacherService.getAssignedSubjectsAndClasses();
      setAssignedSubjects(subjects);
    } catch (error) {
      console.error('Error loading assigned subjects:', error);
    }
  };

  const handleSubjectComment = async (data: any) => {
    try {
      setIsSubmitting(true);
      await reportService.addSubjectComment(report!.id, { subjectId: selectedSubject!.subject.id, comment: data.comment });
      toast.success('Subject comment added successfully');
      setShowCommentModal(false);
      setSelectedSubject(null);
      loadReport(); // Refresh report
    } catch (error) {
      console.error('Error adding subject comment:', error);
      toast.error('Failed to add subject comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverallComment = async (data: any) => {
    try {
      setIsSubmitting(true);
      await reportService.addOverallComment(report!.id, { comment: data.comment });
      toast.success('Overall comment added successfully');
      setShowOverallCommentModal(false);
      loadReport(); // Refresh report
    } catch (error) {
      console.error('Error adding overall comment:', error);
      toast.error('Failed to add overall comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalizeReport = async () => {
    try {
      await reportService.finalizeReport(report!.id);
      toast.success('Report finalized successfully');
      loadReport(); // Refresh report
    } catch (error) {
      console.error('Error finalizing report:', error);
      toast.error('Failed to finalize report');
    }
  };

  const canCommentOnSubject = (subjectReport: SubjectReport): boolean => {
    if (!canAddSubjectComments()) return false;
    
    // Check if teacher is assigned to this subject for this class
    return assignedSubjects.some(assignment => 
      assignment.subject.id === subjectReport.subject.id &&
      assignment.form === report!.classGroup.form &&
      assignment.section === report!.classGroup.section
    );
  };

  const getSubjectGrade = (finalMark: number): string => {
    if (finalMark >= 80) return 'A';
    if (finalMark >= 70) return 'B';
    if (finalMark >= 60) return 'C';
    if (finalMark >= 50) return 'D';
    if (finalMark >= 40) return 'E';
    return 'U';
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'E': return 'text-red-600 bg-red-100';
      case 'U': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateOverallAverage = (): number => {
    if (!report || report.subjectReports.length === 0) return 0;
    const total = report.subjectReports.reduce((sum, sr) => sum + sr.finalMark, 0);
    return Math.round((total / report.subjectReports.length) * 100) / 100;
  };

  const getStatusBadge = () => {
    if (!report) return null;
    
    if (report.finalized) {
      return <Badge variant="success">Finalized</Badge>;
    }
    
    const hasAllSubjectComments = report.subjectReports.every(sr => sr.comment);
    const hasOverallComment = !!report.overallComment;
    
    if (hasAllSubjectComments && hasOverallComment) {
      return <Badge variant="warning">Ready to Finalize</Badge>;
    } else if (hasAllSubjectComments) {
      return <Badge variant="info">Awaiting Class Teacher</Badge>;
    } else {
      return <Badge variant="default">In Progress</Badge>;
    }
  };

  const handleDownloadReport = async () => {
    try {
      await reportService.downloadReport(report!.id);
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Report not found</h3>
          <p className="mt-1 text-sm text-gray-500">The requested report could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/reports')}
          >
            Back to Reports
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {report.student.firstName} {report.student.lastName}'s Report
            </h1>
            <p className="text-gray-600">
              {report.classGroup.form} {report.classGroup.section} - {report.term} {report.academicYear}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {getStatusBadge()}
          {report.finalized && (
            <Button
              variant="outline"
              onClick={handleDownloadReport}
            >
              Download Report
            </Button>
          )}
          {canFinalizeReports() && !report.finalized && (
            <Button
              variant="primary"
              onClick={handleFinalizeReport}
            >
              Finalize Report
            </Button>
          )}
        </div>
      </div>

      {/* Student Information */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Student</p>
              <p className="text-lg font-semibold">{report.student.firstName} {report.student.lastName}</p>
              <p className="text-sm text-gray-600">{report.student.studentId}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Academic Period</p>
              <p className="text-lg font-semibold">{report.term} {report.academicYear}</p>
              <p className="text-sm text-gray-600">{report.classGroup.form} {report.classGroup.section}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Award className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Overall Average</p>
              <p className="text-lg font-semibold">{calculateOverallAverage()}%</p>
              <p className="text-sm text-gray-600">
                Grade: {getSubjectGrade(calculateOverallAverage())}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Subject Reports */}
      <Card>
        <div className="mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Subject Performance
          </h2>
        </div>
        
        <div className="space-y-4">
          {report.subjectReports.map((subjectReport) => {
            const grade = getSubjectGrade(subjectReport.finalMark);
            const canComment = canCommentOnSubject(subjectReport);
            
            return (
              <div key={subjectReport.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-lg">{subjectReport.subject.name}</h3>
                    <p className="text-sm text-gray-600">{subjectReport.subject.code}</p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(grade)}`}>
                      {grade} ({subjectReport.finalMark}%)
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Coursework</p>
                    <p className="text-lg font-semibold">{subjectReport.courseworkMark}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Exam</p>
                    <p className="text-lg font-semibold">{subjectReport.examMark}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Final Mark</p>
                    <p className="text-lg font-semibold">{subjectReport.finalMark}%</p>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">Teacher Comment</p>
                      {subjectReport.comment ? (
                        <p className="text-sm text-gray-700">{subjectReport.comment}</p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No comment added</p>
                      )}
                      {subjectReport.commentBy && (
                        <p className="text-xs text-gray-500 mt-1">
                          By: {subjectReport.commentBy.firstName} {subjectReport.commentBy.lastName}
                        </p>
                      )}
                    </div>
                    
                    {canComment && !report.finalized && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSubject(subjectReport);
                          setShowCommentModal(true);
                        }}
                      >
                        {subjectReport.comment ? 'Edit Comment' : 'Add Comment'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Overall Comment */}
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Overall Comment
          </h2>
          
          {canAddOverallComments() && !report.finalized && (
            <Button
              variant="outline"
              onClick={() => setShowOverallCommentModal(true)}
            >
              {report.overallComment ? 'Edit Comment' : 'Add Comment'}
            </Button>
          )}
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          {report.overallComment ? (
            <div>
              <p className="text-gray-700 mb-2">{report.overallComment}</p>
              {report.overallCommentBy && (
                <p className="text-sm text-gray-500">
                  By: {report.overallCommentBy.firstName} {report.overallCommentBy.lastName}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 italic">No overall comment added</p>
          )}
        </div>
      </Card>

      {/* Subject Comment Modal */}
      <Modal
        isOpen={showCommentModal}
        onClose={() => {
          setShowCommentModal(false);
          setSelectedSubject(null);
        }}
        title={`Comment for ${selectedSubject?.subject.name}`}
        size="lg"
      >
        <ReportCommentForm
          student={report.student}
          subject={selectedSubject?.subject}
          currentComment={selectedSubject?.comment || ''}
          onSubmit={handleSubjectComment}
          onCancel={() => {
            setShowCommentModal(false);
            setSelectedSubject(null);
          }}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Overall Comment Modal */}
      <Modal
        isOpen={showOverallCommentModal}
        onClose={() => setShowOverallCommentModal(false)}
        title="Overall Comment"
        size="lg"
      >
        <ReportCommentForm
          student={report.student}
          currentComment={report.overallComment || ''}
          isOverallComment={true}
          onSubmit={handleOverallComment}
          onCancel={() => setShowOverallCommentModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default ReportDetailPage;