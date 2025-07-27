// src/pages/subjects/SubjectDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useRoleCheck } from '../../hooks/useAuth';
import { subjectService } from '../../services/subjectService';
import { teacherService } from '../../services/teacherService';
import { studentService } from '../../services/studentService';
import type { Subject, Teacher, Student } from '../../types';
import { Card, Button, Badge, Table, Modal } from '../../components/ui';
import { SubjectForm } from '../../components/forms';
import { 
  ArrowLeft, 
  Edit, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  User,
  School
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SUBJECT_CATEGORIES } from '../../types';

const SubjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { canManageSubjects } = useRoleCheck();
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && id) {
      loadSubjectDetails();
    }
  }, [isAuthenticated, id]);

  const loadSubjectDetails = async () => {
    try {
      setLoading(true);
      const subjectId = parseInt(id!);
      
      // Load subject details
      const subjectData = await subjectService.getSubjectById(subjectId);
      setSubject(subjectData);
      
      // Load teachers, students, and classes for this subject
      const [subjectTeachers, subjectStudents, subjectClasses] = await Promise.all([
        subjectService.getTeachersBySubject(subjectId),
        subjectService.getStudentsBySubject(subjectId),
        subjectService.getClassesBySubject(subjectId)
      ]);
      setTeachers(subjectTeachers);
      setStudents(subjectStudents);
      setClasses(subjectClasses);
      
    } catch (error) {
      toast.error('Failed to load subject details');
      console.error('Error loading subject details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubject = async (subjectData: Omit<Subject, 'id'>) => {
    try {
      if (subject) {
        await subjectService.updateSubject(subject.id, subjectData);
        toast.success('Subject updated successfully');
        setIsEditModalOpen(false);
        loadSubjectDetails();
      }
    } catch (error) {
      toast.error('Failed to update subject');
    }
  };

  const getCategoryBadgeColor = (category: string): string => {
    switch (category) {
      case 'JUNIOR_SECONDARY_LANGUAGES':
      case 'O_LEVEL_LANGUAGES':
        return 'bg-blue-100 text-blue-800';
      case 'JUNIOR_SECONDARY_ARTS':
      case 'O_LEVEL_ARTS':
      case 'A_LEVEL_ARTS':
        return 'bg-purple-100 text-purple-800';
      case 'O_LEVEL_COMMERCIALS':
      case 'A_LEVEL_COMMERCIALS':
        return 'bg-green-100 text-green-800';
      case 'JUNIOR_SECONDARY_SCIENCES':
      case 'O_LEVEL_SCIENCES':
      case 'A_LEVEL_SCIENCES':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelBadgeColor = (level: string): string => {
    switch (level) {
      case 'JUNIOR_SECONDARY':
        return 'bg-teal-100 text-teal-800';
      case 'O_LEVEL':
        return 'bg-indigo-100 text-indigo-800';
      case 'A_LEVEL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">Subject not found</h2>
        <p className="text-gray-600 mb-4">The subject you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/app/subjects')}>Back to Subjects</Button>
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
            onClick={() => navigate('/app/subjects')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Subjects</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{subject.name}</h1>
            <p className="text-gray-600">Subject Details</p>
          </div>
        </div>
        {canManageSubjects() && (
          <Button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Subject</span>
          </Button>
        )}
      </div>

      {/* Subject Info */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Code
            </label>
            <p className="text-lg font-semibold text-gray-900">{subject.code}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Name
            </label>
            <p className="text-lg font-semibold text-gray-900">{subject.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level
            </label>
            <Badge className={getLevelBadgeColor(subject.level)}>
              {subject.level.replace('_', ' ')}
            </Badge>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <Badge className={getCategoryBadgeColor(subject.category)}>
              {SUBJECT_CATEGORIES[subject.category as keyof typeof SUBJECT_CATEGORIES]}
            </Badge>
          </div>
        </div>
        
        {subject.description && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <p className="text-gray-600">{subject.description}</p>
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Teachers</p>
              <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Students Enrolled</p>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <School className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Classes</p>
              <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Teachers Teaching This Subject */}
      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Teachers Teaching This Subject</h3>
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Teacher</Table.HeaderCell>
              <Table.HeaderCell>Employee ID</Table.HeaderCell>
              <Table.HeaderCell>Classes Teaching</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {teachers.length > 0 ? (
              teachers.map(teacher => (
                <Table.Row key={teacher.id}>
                  <Table.Cell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium">{teacher.firstName} {teacher.lastName}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-gray-600">{teacher.employeeId}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.classes?.map((className, index) => (
                        <Badge key={`teacher-${teacher.id}-class-${index}`} className="bg-blue-100 text-blue-800">
                          {className}
                        </Badge>
                      ))}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : null}
          </Table.Body>
        </Table>
        {teachers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No teachers assigned to this subject
          </div>
        )}
      </Card>

      {/* Students Enrolled */}
      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Students Enrolled</h3>
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Student</Table.HeaderCell>
              <Table.HeaderCell>Student ID</Table.HeaderCell>
              <Table.HeaderCell>Form & Section</Table.HeaderCell>
              <Table.HeaderCell>Level</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {students.length > 0 ? (
              students.map(student => (
                <Table.Row key={student.id}>
                  <Table.Cell>
                    <div className="flex items-center">
                      <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium">{student.firstName} {student.lastName}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-gray-600">{student.studentId}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge className="bg-gray-100 text-gray-800">
                      {student.form} {student.section}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge className={getLevelBadgeColor(student.level)}>
                      {student.level.replace('_', ' ')}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : null}
          </Table.Body>
        </Table>
        {students.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No students enrolled in this subject
          </div>
        )}
      </Card>

      {/* Edit Subject Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Subject"
      >
        <SubjectForm
          initialData={subject}
          onSubmit={handleUpdateSubject}
        />
      </Modal>
    </div>
  );
};

export default SubjectDetailPage;