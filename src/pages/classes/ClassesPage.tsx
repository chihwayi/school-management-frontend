import React, { useState, useEffect } from 'react';
import { useAuth, useRoleCheck } from '../../hooks/useAuth';
import { classService } from '../../services/classService';
import { teacherService } from '../../services/teacherService';
import type { ClassGroup, Teacher } from '../../types';
import { Card, Button, Input, Table, Modal, Select } from '../../components/ui';
import { ClassForm, ClassTeacherAssignmentForm } from '../../components/forms';
import { Plus, Search, Edit, Trash2, Eye, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';

const ClassesPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { canManageClasses, isTeacher } = useRoleCheck();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassGroup | null>(null);
  const [selectedClassForAssignment, setSelectedClassForAssignment] = useState<ClassGroup | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadClasses();
      loadTeachers();
    }
  }, [isAuthenticated]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      
      let classesData;
      if (isTeacher()) {
        // For teachers, only load their assigned classes
        try {
          // First try to get supervised classes (as class teacher)
          const supervisedClasses = await teacherService.getSupervisedClasses();
          
          // Then get classes they teach subjects in
          const teachingAssignments = await teacherService.getAssignedSubjectsAndClasses();
          
          // Extract unique classes from teaching assignments
          const teachingClasses = teachingAssignments.reduce((classes: any[], assignment: any) => {
            if (!classes.some(c => c.form === assignment.form && c.section === assignment.section)) {
              classes.push({
                id: assignment.classGroupId || 0,
                form: assignment.form,
                section: assignment.section,
                academicYear: assignment.academicYear || new Date().getFullYear().toString()
              });
            }
            return classes;
          }, []);
          
          // Combine both sets of classes (supervised and teaching)
          classesData = [...supervisedClasses, ...teachingClasses];
          
          // Remove duplicates
          classesData = classesData.filter((class1, index, self) => 
            index === self.findIndex(class2 => class2.id === class1.id)
          );
        } catch (error) {
          console.error('Error loading teacher classes:', error);
          classesData = [];
        }
      } else {
        // For admin/clerk, load all classes
        classesData = await classService.getAllClassGroups();
      }
      
      // Load students
      const studentsData = await studentService.getAllStudents();

      console.log('Raw classes data from API:', classesData);

      // Map classes with student counts
      const classesWithStudents = classesData.map((classGroup: any) => {
        // Count students with matching form and section, handling different academic year formats
        const matchingStudents = studentsData.filter((student: any) =>
          student.form === classGroup.form &&
          student.section === classGroup.section &&
          (student.academicYear === classGroup.academicYear ||
            student.academicYear?.includes(classGroup.academicYear))
        );

        return {
          ...classGroup,
          students: matchingStudents,
          studentCount: matchingStudents.length
        };
      });

      console.log('Processed classes with students:', classesWithStudents);
      setClasses(classesWithStudents);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const data = await teacherService.getAllTeachers();
      setTeachers(data);
    } catch (error) {
      toast.error('Failed to load teachers');
    }
  };

  const handleDeleteClass = async (classId: number) => {
    if (window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      try {
        await classService.deleteClassGroup(classId);
        toast.success('Class deleted successfully');
        loadClasses();
      } catch (error) {
        toast.error('Failed to delete class');
      }
    }
  };

  const handleCreateClass = async (classData: Omit<ClassGroup, 'id'>) => {
    try {
      console.log('Creating class with data:', classData);
      const result = await classService.createClassGroup(classData);
      console.log('Class creation result:', result);
      toast.success('Class created successfully');
      setIsModalOpen(false);
      loadClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('Failed to create class');
    }
  };

  const handleUpdateClass = async (classData: Partial<ClassGroup>) => {
    if (!selectedClass) return;

    try {
      await classService.updateClassGroup(selectedClass.id, classData);
      toast.success('Class updated successfully');
      setIsModalOpen(false);
      setSelectedClass(null);
      loadClasses();
    } catch (error) {
      toast.error('Failed to update class');
    }
  };

  const handleAssignTeacher = async (data: { teacherId: number; classGroupId: number }) => {
    try {
      console.log('Assigning teacher with data:', data);
      const result = await classService.assignClassTeacher(data.classGroupId, data.teacherId);
      console.log('Teacher assignment result:', result);
      toast.success('Class teacher assigned successfully');
      setIsAssignmentModalOpen(false);
      setSelectedClassForAssignment(null);
      loadClasses();
    } catch (error) {
      console.error('Error assigning teacher:', error);
      toast.error('Failed to assign class teacher');
    }
  };

  const openEditModal = (classGroup: ClassGroup) => {
    setSelectedClass(classGroup);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedClass(null);
    setIsModalOpen(true);
  };

  const openAssignmentModal = (classGroup: ClassGroup) => {
    setSelectedClassForAssignment(classGroup);
    setIsAssignmentModalOpen(true);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setIsAssignmentModalOpen(false);
    setSelectedClass(null);
    setSelectedClassForAssignment(null);
  };

  const filteredClasses = classes.filter(classGroup => {
    const matchesSearch = searchTerm === '' ||
      classGroup.form.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classGroup.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classGroup.classTeacher?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classGroup.classTeacher?.lastName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesYear = yearFilter === '' || classGroup.academicYear === yearFilter;

    return matchesSearch && matchesYear;
  });

  const uniqueYears = [...new Set(classes.map(c => c.academicYear))];

  const tableColumns = [
    { key: 'form', header: 'Form' },
    { key: 'section', header: 'Section' },
    { key: 'academicYear', header: 'Academic Year' },
    { key: 'classTeacher', header: 'Class Teacher' },
    { key: 'studentCount', header: 'Students' },
    { key: 'actions', header: 'Actions' }
  ];

  const tableData = filteredClasses.map(classGroup => {
    // Debug logging
    console.log('Class group:', classGroup);
    console.log('Class teacher:', classGroup.classTeacher);
    console.log('Class teacher name:', classGroup.classTeacherName);
    console.log('Students:', classGroup.students);

    return {
      id: classGroup.id,
      form: classGroup.form,
      section: classGroup.section,
      academicYear: classGroup.academicYear,
      classTeacher: classGroup.classTeacher && classGroup.classTeacher.firstName
        ? `${classGroup.classTeacher.firstName} ${classGroup.classTeacher.lastName}`
        : classGroup.classTeacherName || 'Not Assigned',
      studentCount: classGroup.students?.length || 0,
      actions: (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/app/classes/${classGroup.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {canManageClasses() && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditModal(classGroup)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAssignmentModal(classGroup)}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClass(classGroup.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </>
          )}
        </div>
      )
    };
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
        {canManageClasses() && (
          <Button onClick={openCreateModal} useTheme>
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        )}
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full sm:w-48"
              options={[{ value: '', label: 'All Years' }, ...uniqueYears.map(year => ({ value: year, label: year }))]}
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Select>
          </div>

          <Table>
            <Table.Header>
              <Table.Row>
                {tableColumns.map(col => <Table.HeaderCell key={col.key}>{col.header}</Table.HeaderCell>)}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {tableData.length > 0 ? (
                tableData.map(row => (
                  <Table.Row key={row.id}>
                    {tableColumns.map(col => (
                      <Table.Cell key={`${row.id}-${col.key}`}>
                        {row[col.key as keyof typeof row]}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))
              ) : null}
            </Table.Body>
          </Table>
          {tableData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No classes found.
            </div>
          )}
        </div>
      </Card>

      {/* Create/Edit Class Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModals}
        title={selectedClass ? 'Edit Class' : 'Create Class'}
      >
        <ClassForm
          initialData={selectedClass || undefined}
          onSubmit={selectedClass ? handleUpdateClass : handleCreateClass}
          teachers={teachers}
          sections={['A', 'B', 'C', 'D']}
        />
      </Modal>

      {/* Assign Teacher Modal */}
      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={closeModals}
        title="Assign Class Teacher"
      >
        <ClassTeacherAssignmentForm
          teachers={teachers}
          classGroups={classes}
          onSubmit={handleAssignTeacher}
          onCancel={closeModals}
        />
      </Modal>
    </div>
  );
};

export default ClassesPage;