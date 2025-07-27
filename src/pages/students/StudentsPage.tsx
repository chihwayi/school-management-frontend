import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { studentService } from '../../services/studentService';
import { LEVELS, FORMS } from '../../types';
import type { Student } from '../../types';
import { Card, Button, Input, Select, Table, Modal } from '../../components/ui';
import StudentCreateForm from '../../components/forms/StudentCreateForm';
import StudentEditForm from '../../components/forms/StudentEditForm';
import StudentImport from '../../components/students/StudentImport';
import { Plus, Search, Filter, Edit, Trash2, Eye, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const StudentsPage: React.FC = () => {
  const { isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [formFilter, setFormFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentService.deleteStudent(studentId);
        toast.success('Student deleted successfully');
        loadStudents();
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const handleCreateStudent = async (studentData: any, guardians: any[]) => {
    try {
      await studentService.createStudent({ ...studentData, guardians });
      toast.success('Student registered successfully');
      setIsModalOpen(false);
      await loadStudents();
    } catch (error) {
      toast.error('Failed to create student');
    }
  };

  const handleEditStudent = async (studentData: any) => {
    try {
      if (selectedStudent) {
        await studentService.updateStudent(selectedStudent.id, studentData);
        toast.success('Student updated successfully');
        setIsModalOpen(false);
        setSelectedStudent(null);
        await loadStudents();
      }
    } catch (error) {
      toast.error('Failed to update student');
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = !levelFilter || student.level === levelFilter;
    const matchesForm = !formFilter || student.form === formFilter;
    
    return matchesSearch && matchesLevel && matchesForm;
  });



  const tableData = filteredStudents.map(student => ({
    studentId: student.studentId,
    firstName: student.firstName,
    lastName: student.lastName,
    level: student.level,
    form: student.form,
    section: student.section,
    actions: (
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/app/students/${student.id}`)}
        >
          <Eye className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedStudent(student);
            setIsModalOpen(true);
          }}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDeleteStudent(student.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    )
  }));

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Students Management</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setIsImportModalOpen(true)} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Students
          </Button>
          <Button onClick={() => setIsModalOpen(true)} useTheme>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                //icon={<Search className="w-4 h-4" />}
              />
            </div>
            <Select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              placeholder="Filter by level"
              options={[
                { value: '', label: 'All Levels' }, 
                { value: LEVELS.JUNIOR_SECONDARY, label: 'Junior Secondary' },
                { value: LEVELS.O_LEVEL, label: 'O Level' }, 
                { value: LEVELS.A_LEVEL, label: 'A Level' }
              ]}
            >
            </Select>
            <Select
              value={formFilter}
              onChange={(e) => setFormFilter(e.target.value)}
              options={[
                { value: '', label: 'All Forms' },
                ...[...FORMS.JUNIOR_SECONDARY, ...FORMS.O_LEVEL, ...FORMS.A_LEVEL].map(form => ({
                  value: form,
                  label: form
                }))
              ]}
              placeholder="Filter by form"
            />
          </div>
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
                  <Table.HeaderCell>Student ID</Table.HeaderCell>
                  <Table.HeaderCell>First Name</Table.HeaderCell>
                  <Table.HeaderCell>Last Name</Table.HeaderCell>
                  <Table.HeaderCell>Level</Table.HeaderCell>
                  <Table.HeaderCell>Form</Table.HeaderCell>
                  <Table.HeaderCell>Section</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {tableData.length > 0 ? (
                  tableData.map((student, index) => (
                    <Table.Row key={index}>
                      <Table.Cell>{student.studentId}</Table.Cell>
                      <Table.Cell>{student.firstName}</Table.Cell>
                      <Table.Cell>{student.lastName}</Table.Cell>
                      <Table.Cell>{student.level}</Table.Cell>
                      <Table.Cell>{student.form}</Table.Cell>
                      <Table.Cell>{student.section}</Table.Cell>
                      <Table.Cell>{student.actions}</Table.Cell>
                    </Table.Row>
                  ))
                ) : null}
              </Table.Body>
            </Table>
            {tableData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No students found
              </div>
            )}
          </>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudent(null);
        }}
        title={selectedStudent ? 'Edit Student' : 'Add New Student'}
      >
        {selectedStudent ? (
          <StudentEditForm
            student={selectedStudent}
            onSubmit={handleEditStudent}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedStudent(null);
            }}
          />
        ) : (
          <StudentCreateForm
            onSubmit={handleCreateStudent}
            subjects={[]}
          />
        )}
      </Modal>

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Students"
        size="lg"
      >
        <StudentImport />
      </Modal>
    </div>
  );
};

export default StudentsPage;
