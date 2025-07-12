import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherService } from '../../services/teacherService';
import { teacherAssignmentService } from '../../services/teacherAssignmentService';
import type { Teacher, TeacherSubjectClass, ClassGroup } from '../../types';
import { Card, Button, Badge, Table } from '../../components/ui';
import { ArrowLeft, Edit, Mail, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TeacherDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [assignments, setAssignments] = useState<TeacherSubjectClass[]>([]);
  const [supervisedClasses, setSupervisedClasses] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTeacherDetails(parseInt(id));
    }
  }, [id]);

  const loadTeacherDetails = async (teacherId: number) => {
    try {
      setLoading(true);
      const [teacherData, assignmentsData] = await Promise.all([
        teacherService.getTeacherById(teacherId),
        teacherAssignmentService.getTeacherAssignments(teacherId)
      ]);
      
      setTeacher(teacherData);
      setAssignments(assignmentsData);
      setSupervisedClasses(teacherData.supervisedClasses || []);
    } catch (error) {
      toast.error('Failed to load teacher details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!teacher) {
    return <div className="p-6">Teacher not found</div>;
  }

  const assignmentsData = assignments.map(assignment => ({
    subject: assignment.subject.name,
    class: `${assignment.form} ${assignment.section}`,
    academicYear: assignment.academicYear
  }));

  const classesData = supervisedClasses.map(classGroup => ({
    class: `${classGroup.form} ${classGroup.section}`,
    academicYear: classGroup.academicYear,
    students: classGroup.students?.length || 0
  }));

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/teachers')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teachers
        </Button>
        <h1 className="text-2xl font-bold">Teacher Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teacher Information */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {teacher.firstName} {teacher.lastName}
                  </h2>
                  <p className="text-gray-600">Employee ID: {teacher.employeeId}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/teachers/${teacher.id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{teacher.user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>{teacher.user.username}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {teacher.user.roles.map(role => (
                      <Badge key={role.id} variant="info">
                        {role.name.replace('ROLE_', '')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Assignments and Classes */}
        <div className="lg:col-span-2">
          {/* Subject Assignments */}
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Subject Assignments</h3>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Subject</Table.HeaderCell>
                    <Table.HeaderCell>Class</Table.HeaderCell>
                    <Table.HeaderCell>Academic Year</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {assignmentsData.length > 0 ? (
                    assignmentsData.map((assignment, index) => (
                      <Table.Row key={index}>
                        <Table.Cell>{assignment.subject}</Table.Cell>
                        <Table.Cell>{assignment.class}</Table.Cell>
                        <Table.Cell>{assignment.academicYear}</Table.Cell>
                      </Table.Row>
                    ))
                  ) : null}
                </Table.Body>
              </Table>
              {assignmentsData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No subject assignments found
                </div>
              )}
            </div>
          </Card>

          {/* Class Teacher Assignments */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Class Teacher Assignments</h3>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Class</Table.HeaderCell>
                    <Table.HeaderCell>Academic Year</Table.HeaderCell>
                    <Table.HeaderCell>Students</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {classesData.length > 0 ? (
                    classesData.map((classData, index) => (
                      <Table.Row key={index}>
                        <Table.Cell>{classData.class}</Table.Cell>
                        <Table.Cell>{classData.academicYear}</Table.Cell>
                        <Table.Cell>{classData.students}</Table.Cell>
                      </Table.Row>
                    ))
                  ) : null}
                </Table.Body>
              </Table>
              {classesData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No class teacher assignments found
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailPage;