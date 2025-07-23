import React, { useState } from 'react';
import { useAuth, useRoleCheck } from '../../hooks/useAuth';
import { Card, Button, Input, Table, Modal } from '../../components/ui';
import { TeacherRegistrationForm } from '../../components/forms';
import { Plus, Eye, Edit, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Mock data to avoid API calls
const mockTeachers = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    employeeId: 'T001',
    user: { email: 'john.doe@school.com', roles: ['TEACHER'] }
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    employeeId: 'T002',
    user: { email: 'jane.smith@school.com', roles: ['TEACHER', 'ADMIN'] }
  },
  {
    id: 3,
    firstName: 'Robert',
    lastName: 'Johnson',
    employeeId: 'T003',
    user: { email: 'robert.johnson@school.com', roles: ['TEACHER'] }
  }
];

const MockTeachersPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { canManageTeachers } = useRoleCheck();
  const navigate = useNavigate();
  const [teachers] = useState(mockTeachers);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFormSubmit = async () => {
    toast.success('This is a mock implementation. No changes were made.');
    setIsModalOpen(false);
  };

  const handleDeleteTeacher = () => {
    toast.info('This is a mock implementation. No teacher was deleted.');
  };

  const filteredTeachers = teachers.filter(teacher => {
    const fullName = `${teacher.firstName} ${teacher.lastName}`;
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (teacher.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const tableData = filteredTeachers.map(teacher => ({
    employeeId: teacher.employeeId,
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    email: teacher.user?.email || 'N/A',
    roles: teacher.user?.roles ? 
      teacher.user.roles.map((role: string) => role.replace('ROLE_', '')).join(', ') : 'N/A',
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
              onClick={() => setIsModalOpen(true)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Subject assignment feature is under development')}
            >
              <UserPlus className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteTeacher}
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
                {tableData.map((teacher, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{teacher.employeeId}</Table.Cell>
                    <Table.Cell>{teacher.firstName}</Table.Cell>
                    <Table.Cell>{teacher.lastName}</Table.Cell>
                    <Table.Cell>{teacher.email}</Table.Cell>
                    <Table.Cell>{teacher.roles}</Table.Cell>
                    <Table.Cell>{teacher.actions}</Table.Cell>
                  </Table.Row>
                ))}
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
        onClose={() => setIsModalOpen(false)}
        title="Add New Teacher"
      >
        <TeacherRegistrationForm
          onSubmit={handleFormSubmit}
        />
      </Modal>
    </div>
  );
};

export default MockTeachersPage;