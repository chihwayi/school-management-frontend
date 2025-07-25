import React, { useState, useEffect } from 'react';
import { useAuth, useRoleCheck } from '../../hooks/useAuth';
import { assessmentService } from '../../services/assessmentService';
import { teacherService } from '../../services/teacherService';
import { studentService } from '../../services/studentService';
import { AssessmentType } from '../../types';
import type { Assessment, TeacherSubjectClass  } from '../../types';
import { Card, Button, Input, Table, Modal, Select, Badge } from '../../components/ui';
import { AssessmentForm } from '../../components/forms';
import { Plus, Search, Edit, Trash2, Eye, FileText, Calendar, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { formatAssessmentType } from '../../utils';

const AssessmentsPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { canRecordAssessments, isTeacher, canManageUsers, isClassTeacher } = useRoleCheck();
  const navigate = useNavigate();
  
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherSubjectClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [termFilter, setTermFilter] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (isTeacher()) {
        // Load teacher's assigned subjects and classes
        const assignments = await teacherService.getAssignedSubjectsAndClasses();
        setTeacherAssignments(assignments);
        
        // Load assessments for teacher's students
        const allAssessments: Assessment[] = [];
        for (const assignment of assignments) {
          // Skip assignments with missing data
          if (!assignment?.form || !assignment?.section || !assignment?.subjectId) {
            console.warn('Skipping assignment with missing data:', assignment);
            continue;
          }
          
          try {
            const students = await studentService.getStudentsByClass(assignment.form, assignment.section);
            for (const student of students) {
              if (!student?.id) continue;
              
              const studentAssessments = await assessmentService.getStudentSubjectAssessments(
                student.id, 
                assignment.subjectId // Use subjectId directly instead of assignment.subject.id
              );
              allAssessments.push(...studentAssessments);
            }
          } catch (error) {
            console.error(`Error processing assignment ${assignment.id}:`, error);
          }
        }
        setAssessments(allAssessments);
      } else {
        // Admin/Clerk can see all assessments - this would need a different endpoint
        // For now, we'll show empty state for non-teachers
        setAssessments([]);
      }
    } catch (error) {
      console.error('Error loading assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = () => {
    if (teacherAssignments.length === 0) {
      toast.error('You have no subject assignments. Please contact your administrator.');
      return;
    }
    setSelectedAssessment(null);
    setIsModalOpen(true);
  };

  const handleEditAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsModalOpen(true);
  };

  const handleDeleteAssessment = async (assessmentId: number) => {
    if (window.confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      try {
        await assessmentService.deleteAssessment(assessmentId);
        toast.success('Assessment deleted successfully');
        loadData();
      } catch (error) {
        console.error('Error deleting assessment:', error);
        toast.error('Failed to delete assessment');
      }
    }
  };

  const handleAssessmentSubmit = async (assessmentData: any) => {
    try {
      if (selectedAssessment) {
        await assessmentService.updateAssessment(selectedAssessment.id, assessmentData);
        toast.success('Assessment updated successfully');
      } else {
        await assessmentService.recordAssessment(assessmentData);
        toast.success('Assessment recorded successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Failed to save assessment');
    }
  };

  const getFilteredAssessments = () => {
    return assessments.filter(assessment => {
      const matchesSearch = 
        assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.studentFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.studentLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.subjectName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = !typeFilter || assessment.type === typeFilter;
      const matchesTerm = !termFilter || assessment.term === termFilter;
      const matchesClass = !classFilter || 
        `${assessment.studentForm} ${assessment.studentSection}`.includes(classFilter);

      return matchesSearch && matchesType && matchesTerm && matchesClass;
    });
  };

  const getUniqueClasses = () => {
    const classes = new Set<string>();
    assessments.forEach(assessment => {
      classes.add(`${assessment.studentForm} ${assessment.studentSection}`);
    });
    return Array.from(classes).sort();
  };

  const getUniqueTerms = () => {
    const terms = new Set<string>();
    assessments.forEach(assessment => {
      terms.add(assessment.term);
    });
    return Array.from(terms).sort();
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-600">Manage student assessments and exam results</p>
          {canRecordAssessments() && teacherAssignments.length === 0 && (
            <p className="text-amber-600 text-sm mt-1">
              You have no subject assignments. Contact your administrator to assign subjects.
            </p>
          )}
        </div>
        {canRecordAssessments() && teacherAssignments.length > 0 && (
          <Button onClick={handleCreateAssessment} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Record Assessment</span>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium">Filters</h3>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: '', label: 'All Types' },
                { value: AssessmentType.COURSEWORK, label: 'Coursework' },
                { value: AssessmentType.FINAL_EXAM, label: 'Final Exam' },
              ]}
            >
            </Select>
            <Select
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              options={[
                { value: '', label: 'All Terms' },
                ...getUniqueTerms().map(term => ({ value: term, label: term }))
              ]}
            >
            </Select>
            <Select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              options={[
                { value: '', label: 'All Classes' },
                ...getUniqueClasses().map(classGroup => ({ value: classGroup, label: classGroup }))
              ]}
            >
            </Select>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Coursework</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assessments.filter(a => a.type === AssessmentType.COURSEWORK).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Final Exams</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assessments.filter(a => a.type === AssessmentType.FINAL_EXAM).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assessments.length > 0 
                    ? Math.round(assessments.reduce((sum, a) => sum + (a.score / a.maxScore) * 100, 0) / assessments.length)
                    : 0}%
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Assessments Table */}
      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Assessment Records</h3>
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Student</Table.HeaderCell>
              <Table.HeaderCell>Subject</Table.HeaderCell>
              <Table.HeaderCell>Assessment</Table.HeaderCell>
              <Table.HeaderCell>Score</Table.HeaderCell>
              <Table.HeaderCell>Term</Table.HeaderCell>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {getFilteredAssessments().length > 0 ? (
              getFilteredAssessments().map(assessment => (
                <Table.Row key={assessment.id}>
                  <Table.Cell>
                    <div>
                      <div className="font-medium">
                        {assessment.studentFirstName} {assessment.studentLastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assessment.studentForm} {assessment.studentSection}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <div className="font-medium">{assessment.subjectName}</div>
                      <div className="text-sm text-gray-500">{assessment.subjectCode}</div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <div className="font-medium">{assessment.title}</div>
                      <Badge 
                        variant={assessment.type === AssessmentType.COURSEWORK ? 'default' : 'info'}
                        className="mt-1"
                      >
                        {formatAssessmentType(assessment.type)}
                      </Badge>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className={`font-medium ${getScoreColor(assessment.score, assessment.maxScore)}`}>
                      {assessment.score}/{assessment.maxScore}
                      <div className="text-sm text-gray-500">
                        ({Math.round((assessment.score / assessment.maxScore) * 100)}%)
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <div className="font-medium">{assessment.term}</div>
                      <div className="text-sm text-gray-500">{assessment.academicYear}</div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm">
                      {new Date(assessment.date).toLocaleDateString()}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAssessment(assessment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAssessment(assessment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell className="text-center">
                  <div className="text-center py-8 text-gray-500">
                    No assessments found
                  </div>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </Card>

      {/* Assessment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAssessment ? 'Edit Assessment' : 'Record Assessment'}
      >
        <AssessmentForm
          initialData={selectedAssessment || undefined}
          onSubmit={handleAssessmentSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default AssessmentsPage;