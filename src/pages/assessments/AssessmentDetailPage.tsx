import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useRoleCheck } from '../../hooks/useAuth';
import { assessmentService } from '../../services/assessmentService';
import type { Assessment } from '../../types';
import { AssessmentType } from '../../types';
import { Card, Button, Badge, Modal } from '../../components/ui';
import { AssessmentForm } from '../../components/forms';
import { ArrowLeft, Edit, Trash2, Calendar, User, BookOpen, Target, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatAssessmentType } from '../../utils';

const AssessmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { canRecordAssessments } = useRoleCheck();
  
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && id) {
      loadAssessment();
    }
  }, [isAuthenticated, id]);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      const assessmentData = await assessmentService.getAssessmentById(parseInt(id!));
      setAssessment(assessmentData);
    } catch (error) {
      console.error('Error loading assessment:', error);
      toast.error('Failed to load assessment details');
      navigate('/assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      try {
        await assessmentService.deleteAssessment(assessment!.id);
        toast.success('Assessment deleted successfully');
        navigate('/assessments');
      } catch (error) {
        console.error('Error deleting assessment:', error);
        toast.error('Failed to delete assessment');
      }
    }
  };

  const handleUpdateAssessment = async (assessmentData: any) => {
    try {
      await assessmentService.updateAssessment(assessment!.id, assessmentData);
      toast.success('Assessment updated successfully');
      setIsEditModalOpen(false);
      loadAssessment();
    } catch (error) {
      console.error('Error updating assessment:', error);
      toast.error('Failed to update assessment');
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-50 border-green-200';
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getPerformanceLevel = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 70) return 'Good';
    if (percentage >= 60) return 'Satisfactory';
    if (percentage >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Assessment not found</p>
        <Button onClick={() => navigate('/assessments')} className="mt-4">
          Back to Assessments
        </Button>
      </div>
    );
  }

  const percentage = Math.round((assessment.score / assessment.maxScore) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/assessments')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Assessments</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
            <p className="text-gray-600">Assessment Details</p>
          </div>
        </div>
        {canRecordAssessments() && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleEdit}
              className="flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          </div>
        )}
      </div>

      {/* Score Card */}
      <Card className={`${getScoreBackground(assessment.score, assessment.maxScore)} border-2`}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Score</h2>
              <div className={`text-3xl font-bold ${getScoreColor(assessment.score, assessment.maxScore)}`}>
                {assessment.score}/{assessment.maxScore}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {percentage}% - {getPerformanceLevel(assessment.score, assessment.maxScore)}
              </div>
            </div>
            <div className="text-right">
              <TrendingUp className={`h-12 w-12 ${getScoreColor(assessment.score, assessment.maxScore)}`} />
            </div>
          </div>
        </div>
      </Card>

      {/* Assessment Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Assessment Information</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <Target className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Type</p>
                <Badge variant={assessment.type === AssessmentType.COURSEWORK ? 'default' : 'info'}>
                  {formatAssessmentType(assessment.type)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Date</p>
                <p className="text-gray-900">{new Date(assessment.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <BookOpen className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Academic Period</p>
                <p className="text-gray-900">{assessment.term} {assessment.academicYear}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Student & Subject Information */}
        <Card>
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Student & Subject</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Student</p>
                <p className="text-gray-900 font-medium">
                  {assessment.studentSubject.student.firstName} {assessment.studentSubject.student.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  {assessment.studentSubject.student.form} {assessment.studentSubject.student.section}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <BookOpen className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Subject</p>
                <p className="text-gray-900 font-medium">{assessment.studentSubject.subject.name}</p>
                <p className="text-sm text-gray-500">{assessment.studentSubject.subject.code}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Analysis */}
      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Performance Analysis</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{assessment.score}</div>
              <div className="text-sm text-gray-500">Points Scored</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{assessment.maxScore}</div>
              <div className="text-sm text-gray-500">Total Points</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(assessment.score, assessment.maxScore)}`}>
                {percentage}%
              </div>
              <div className="text-sm text-gray-500">Percentage</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  percentage >= 80 ? 'bg-green-500' : 
                  percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Assessment Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Assessment"
      >
        <AssessmentForm
          initialData={assessment}
          studentSubjectId={assessment.studentSubject.id}
          onSubmit={handleUpdateAssessment}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default AssessmentDetailPage;