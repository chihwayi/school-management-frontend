import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { guardianService } from '../../services/guardianService';
import { reportService } from '../../services/reportService';
import type { Student, Guardian, Report } from '../../types';
import { Card, Button, Badge, Table, Modal } from '../../components/ui';
import { GuardianForm } from '../../components/forms';
import { ArrowLeft, Edit, Plus, Phone } from 'lucide-react';
import { WhatsAppIcon } from '../../components/common';
import { toast } from 'react-hot-toast';

const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadStudentDetails(parseInt(id));
    }
  }, [id]);

  const loadStudentDetails = async (studentId: number) => {
    try {
      setLoading(true);
      const [studentData, guardiansData, reportsData] = await Promise.all([
        studentService.getStudentById(studentId),
        guardianService.getGuardiansByStudent(studentId),
        reportService.getStudentReports(studentId)
      ]);
      
      setStudent(studentData);
      setGuardians(guardiansData);
      setReports(reportsData);
    } catch (error) {
      toast.error('Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!student) {
    return <div className="p-6">Student not found</div>;
  }



  const reportsData = reports.map(report => ({
    term: report.term,
    academicYear: report.academicYear,
    finalized: (
      <Badge variant={report.finalized ? 'success' : 'warning'}>
        {report.finalized ? 'Finalized' : 'In Progress'}
      </Badge>
    ),
    actions: (
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(`/app/reports/${report.id}`)}
      >
        View Report
      </Button>
    )
  }));

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/app/students')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Students
        </Button>
        <h1 className="text-2xl font-bold">Student Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Information */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {student.firstName} {student.lastName}
                  </h2>
                  <p className="text-gray-600">Student ID: {student.studentId}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/app/students/${student.id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Level</p>
                  <p className="font-medium">{student.level}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Form</p>
                  <p className="font-medium">{student.form}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Section</p>
                  <p className="font-medium">{student.section}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Enrollment Date</p>
                  <p className="font-medium">
                    {new Date(student.enrollmentDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Reports */}
          <Card className="mt-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Academic Reports</h3>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Term</Table.HeaderCell>
                    <Table.HeaderCell>Year</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {reportsData.length > 0 ? (
                    reportsData.map((report, index) => (
                      <Table.Row key={index}>
                        <Table.Cell>{report.term}</Table.Cell>
                        <Table.Cell>{report.academicYear}</Table.Cell>
                        <Table.Cell>{report.finalized}</Table.Cell>
                        <Table.Cell>{report.actions}</Table.Cell>
                      </Table.Row>
                    ))
                  ) : null}
                </Table.Body>
              </Table>
              {reportsData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No reports found
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Guardians */}
        <div>
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Guardians</h3>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/app/guardians?studentId=${student.id}`)}
                  >
                    Manage Guardians
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsGuardianModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Guardian
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {guardians.map(guardian => (
                  <div
                    key={guardian.id}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{guardian.name}</h4>
                      {guardian.primaryGuardian && (
                        <Badge variant="success" size="sm">Primary</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {guardian.relationship}
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4" />
                        {guardian.phoneNumber}
                      </div>
                      {guardian.whatsappNumber && (
                        <div className="flex items-center gap-2 text-sm">
                          <WhatsAppIcon />
                          {guardian.whatsappNumber}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Guardian Form Modal */}
      <Modal
        isOpen={isGuardianModalOpen}
        onClose={() => setIsGuardianModalOpen(false)}
        title="Add Guardian"
      >
        <GuardianForm
          onSubmit={async (data) => {
            if (student) {
              await guardianService.addGuardianToStudent(student.id, data);
            }
          }}
          onSuccess={() => {
            setIsGuardianModalOpen(false);
            if (student) {
              loadStudentDetails(student.id);
            }
            toast.success('Guardian added successfully');
          }}
          onCancel={() => setIsGuardianModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default StudentDetailPage;
