import React, { useState, useEffect } from 'react';
import { useAuth, useRoleCheck } from '../../hooks/useAuth';
import { teacherService } from '../../services/teacherService';
import { subjectService } from '../../services/subjectService';
import type { Teacher, Subject } from '../../types';
import { Card, Button, Input, Table, Modal } from '../../components/ui';
import { TeacherRegistrationForm, TeacherAssignmentForm } from '../../components/forms';
import TeacherEditForm from '../../components/forms/TeacherEditForm';
import { Plus, Search, Edit, Trash2, Eye, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const TeachersPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { canManageTeachers } = useRoleCheck();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedTeacherForAssignment, setSelectedTeacherForAssignment] = useState<Teacher | null>(null);

  useEffect(() => {
    loadTeachers();
    loadSubjects();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getAllTeachers();
      console.log('Teachers data:', data);
      
      // Log roles for debugging
      data.forEach(teacher => {
        console.log(`Teacher ${teacher.firstName} ${teacher.lastName} roles:`, 
          teacher.user?.roles);
      });
      
      setTeachers(data);
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const data = await subjectService.getAllSubjects();
      setSubjects(data);
    } catch (error) {
      toast.error('Failed to load subjects');
    }
  };

  const handleDeleteTeacher = async (teacherId: number) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await teacherService.deleteTeacher(teacherId);
        toast.success('Teacher deleted successfully');
        loadTeachers();
      } catch (error) {
        toast.error('Failed to delete teacher');
      }
    }
  };

  const handleFormSubmit = async (teacherData: any) => {
    try {
      if (selectedTeacher) {
        await teacherService.updateTeacher(selectedTeacher.id, teacherData);
        toast.success('Teacher updated successfully');
      } else {
        await teacherService.createTeacher(teacherData);
        toast.success('Teacher created successfully');
      }
      setIsModalOpen(false);
      setSelectedTeacher(null);
      await loadTeachers();
    } catch (error) {
      toast.error('Failed to save teacher');
    }
  };

  const handleAssignmentSubmit = async (assignmentData: any) => {
    try {
      await teacherService.assignTeacher(assignmentData);
      toast.success('Teacher assigned successfully');
      setIsAssignmentModalOpen(false);
      setSelectedTeacherForAssignment(null);
      await loadTeachers();
    } catch (error) {
      toast.error('Failed to assign teacher');
    }
  };

  const filteredTeachers = Array.isArray(teachers) ? teachers.filter(teacher => {
    const fullName = `${teacher.firstName} ${teacher.lastName}`;
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (teacher.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];



  const tableData = filteredTeachers.map(teacher => ({
    employeeId: teacher.employeeId,
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    email: teacher.user?.email || 'N/A',
    roles: teacher.user?.roles ? (
      Array.isArray(teacher.user.roles) ? 
        teacher.user.roles.map((role: any) => {
          let roleName = '';
          if (typeof role === 'string') {
            roleName = role.replace('ROLE_', '');
          } else if (typeof role.name === 'string') {
            roleName = role.name.replace('ROLE_', '');
          }
          return roleName;
        }).filter(Boolean).join(', ') : 'N/A'
    ) : 'N/A',
    actions: (
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/app/teachers/${teacher.id}`)}
        >
          <Eye className="w-4 h-4" />
        </Button>
        {canManageTeachers() && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedTeacher(teacher);
                setIsModalOpen(true);
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedTeacherForAssignment(teacher);
                setIsAssignmentModalOpen(true);
              }}
            >
              <UserPlus className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteTeacher(teacher.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    )
  }));

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teachers Management</h1>
        {canManageTeachers() && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/app/teachers/subjects')}
            >
              Bulk Subject Assignments
            </Button>
            <Button onClick={() => setIsModalOpen(true)} useTheme>
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
          </div>
        )}
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <Input
            placeholder="Search teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            //icon={<Search className="w-4 h-4" />}
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Employee ID</Table.HeaderCell>
                  <Table.HeaderCell>First Name</Table.HeaderCell>
                  <Table.HeaderCell>Last Name</Table.HeaderCell>
                  <Table.HeaderCell>Email</Table.HeaderCell>
                  <Table.HeaderCell>Roles</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {tableData.length > 0 ? (
                  tableData.map((teacher, index) => (
                    <Table.Row key={index}>
                      <Table.Cell>{teacher.employeeId}</Table.Cell>
                      <Table.Cell>{teacher.firstName}</Table.Cell>
                      <Table.Cell>{teacher.lastName}</Table.Cell>
                      <Table.Cell>{teacher.email}</Table.Cell>
                      <Table.Cell>{teacher.roles}</Table.Cell>
                      <Table.Cell>{teacher.actions}</Table.Cell>
                    </Table.Row>
                  ))
                ) : null}
              </Table.Body>
            </Table>
            {tableData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No teachers found
              </div>
            )}
          </>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTeacher(null);
        }}
        title={selectedTeacher ? 'Edit Teacher' : 'Add New Teacher'}
      >
        {selectedTeacher ? (
          <TeacherEditForm
            teacher={selectedTeacher}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedTeacher(null);
            }}
          />
        ) : (
          <TeacherRegistrationForm
            onSubmit={handleFormSubmit}
          />
        )}
      </Modal>

      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={() => {
          setIsAssignmentModalOpen(false);
          setSelectedTeacherForAssignment(null);
        }}
        title="Assign Teacher to Subjects"
      >
        <TeacherAssignmentForm
          teachers={teachers}
          subjects={subjects}
          selectedTeacher={selectedTeacherForAssignment}
          onSubmit={handleAssignmentSubmit}
          onCancel={() => {
            setIsAssignmentModalOpen(false);
            setSelectedTeacherForAssignment(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default TeachersPage;