import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useRoleCheck } from '../../hooks/useAuth';
import { classService } from '../../services/classService';
import { attendanceService } from '../../services/attendanceService';
import { reportService } from '../../services/reportService';
import type { ClassGroup, Student, Attendance, Report } from '../../types';
import { Card, Button, Table, Modal, Select, Badge } from '../../components/ui';
import { BulkAttendanceForm, ReportCommentForm } from '../../components/forms';
import { Users, Calendar, FileText, Edit, UserCheck, ArrowLeft, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const ClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { canMarkAttendance, canViewReports, canFinalizeReports } = useRoleCheck();
  
  const [classGroup, setClassGroup] = useState<ClassGroup | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'reports'>('overview');
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTerm, setSelectedTerm] = useState<string>('Term 1');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  useEffect(() => {
    if (isAuthenticated && id) {
      loadClassDetails();
    }
  }, [isAuthenticated, id]);

  const loadClassDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      // Load class data
      try {
        const classData = await classService.getClassGroupById(parseInt(id));
        console.log('Class data loaded:', classData);
        setClassGroup(classData);
        
        // Load reports if we have the class data
        loadReports(classData.id, selectedTerm, selectedYear);
      } catch (error) {
        console.error('Error loading class:', error);
        toast.error('Failed to load class details');
      }
      
      // Load students separately
      try {
        const studentsData = await classService.getStudentsInClass(parseInt(id));
        console.log('Students data loaded:', studentsData);
        setStudents(studentsData);
        
        // Load attendance for today
        loadAttendanceForDate(selectedDate);
      } catch (error) {
        console.error('Error loading students:', error);
        toast.error('Failed to load students');
      }
    } catch (error) {
      toast.error('Failed to load class details');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceForDate = async (date: string) => {
    try {
      const attendanceData = await attendanceService.getAttendanceByDate(date);
      // Filter attendance for this class's students
      const classStudentIds = students.map(s => s.id);
      const filteredAttendance = attendanceData.filter(a => 
        classStudentIds.includes(a.student.id)
      );
      setAttendance(filteredAttendance);
    } catch (error) {
      console.error('Error loading attendance:', error);
      toast.error('Failed to load attendance');
    }
  };

  const loadReports = async (classId: number, term: string, year: string) => {
    try {
      const reportsData = await reportService.getClassReports(classId, term, year);
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports');
    }
  };

  const handleMarkAttendance = async (data: { date: string; attendanceRecords: { studentId: number; present: boolean }[] }) => {
    try {
      await Promise.all(
        data.attendanceRecords.map(record => 
          attendanceService.markAttendance(record.studentId, data.date, record.present)
        )
      );
      toast.success('Attendance marked successfully');
      setIsAttendanceModalOpen(false);
      loadAttendanceForDate(data.date);
    } catch (error) {
      toast.error('Failed to mark attendance');
    }
  };

  const handleGenerateReports = async () => {
    if (!classGroup) return;

    try {
      await reportService.generateClassReports(classGroup.id, selectedTerm, selectedYear);
      toast.success('Reports generated successfully');
      loadReports(classGroup.id, selectedTerm, selectedYear);
    } catch (error) {
      toast.error('Failed to generate reports');
    }
  };

  const handleFinalizeReport = async (reportId: number) => {
    try {
      await reportService.finalizeReport(reportId);
      toast.success('Report finalized successfully');
      loadReports(classGroup!.id, selectedTerm, selectedYear);
    } catch (error) {
      toast.error('Failed to finalize report');
    }
  };

  const openReportModal = (report: Report) => {
    setSelectedReport(report);
    setIsReportModalOpen(true);
  };

  const closeModals = () => {
    setIsAttendanceModalOpen(false);
    setIsReportModalOpen(false);
    setSelectedReport(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!classGroup) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Class not found</p>
        <Button onClick={() => navigate('/classes')} className="mt-4">
          Back to Classes
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];



  const studentData = students.map(student => {
    const todayAttendance = attendance.find(a => a.student.id === student.id);
    return {
      id: student.id,
      studentId: student.studentId,
      fullName: `${student.firstName} ${student.lastName}`,
      level: student.level,
      attendanceStatus: todayAttendance ? (
        <Badge variant={todayAttendance.present ? 'success' : 'error'}>
          {todayAttendance.present ? 'Present' : 'Absent'}
        </Badge>
      ) : (
        <Badge variant="warning">Not marked</Badge>
      ),
      actions: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/app/students/${student.id}`)}
        >
          View
        </Button>
      )
    };
  });



  const reportData = reports.map(report => ({
    id: report.id,
    studentName: `${report.student.firstName} ${report.student.lastName}`,
    overallComment: report.overallComment ? 'Added' : 'Pending',
    status: (
      <Badge variant={report.finalized ? 'success' : 'warning'}>
        {report.finalized ? 'Finalized' : 'Draft'}
      </Badge>
    ),
    actions: (
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => openReportModal(report)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        {canFinalizeReports() && !report.finalized && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFinalizeReport(report.id)}
          >
            Finalize
          </Button>
        )}
      </div>
    )
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/app/classes')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {classGroup.form} {classGroup.section}
            </h1>
            <p className="text-gray-600">Academic Year: {classGroup.academicYear}</p>
          </div>
        </div>
      </div>

      {/* Class Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendance.filter(a => a.present).length}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Class Teacher</p>
                <p className="text-lg font-semibold text-gray-900">
                  {classGroup.classTeacher ? 
                    `${classGroup.classTeacher.firstName} ${classGroup.classTeacher.lastName}` : 
                    'Not assigned'
                  }
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Students</h2>
              {canMarkAttendance() && (
                <Button onClick={() => setIsAttendanceModalOpen(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Mark Attendance
                </Button>
              )}
            </div>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Student ID</Table.HeaderCell>
                  <Table.HeaderCell>Full Name</Table.HeaderCell>
                  <Table.HeaderCell>Level</Table.HeaderCell>
                  <Table.HeaderCell>Today's Attendance</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {studentData.length > 0 ? (
                  studentData.map(student => (
                    <Table.Row key={student.id}>
                      <Table.Cell>{student.studentId}</Table.Cell>
                      <Table.Cell>{student.fullName}</Table.Cell>
                      <Table.Cell>{student.level}</Table.Cell>
                      <Table.Cell>{student.attendanceStatus}</Table.Cell>
                      <Table.Cell>{student.actions}</Table.Cell>
                    </Table.Row>
                  ))
                ) : null}
              </Table.Body>
            </Table>
            {studentData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No students found
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'attendance' && (
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    loadAttendanceForDate(e.target.value);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                {canMarkAttendance() && (
                  <Button onClick={() => setIsAttendanceModalOpen(true)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Mark Attendance
                  </Button>
                )}
              </div>
            </div>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Student ID</Table.HeaderCell>
                  <Table.HeaderCell>Full Name</Table.HeaderCell>
                  <Table.HeaderCell>Level</Table.HeaderCell>
                  <Table.HeaderCell>Today's Attendance</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {studentData.length > 0 ? (
                  studentData.map(student => (
                    <Table.Row key={student.id}>
                      <Table.Cell>{student.studentId}</Table.Cell>
                      <Table.Cell>{student.fullName}</Table.Cell>
                      <Table.Cell>{student.level}</Table.Cell>
                      <Table.Cell>{student.attendanceStatus}</Table.Cell>
                      <Table.Cell>{student.actions}</Table.Cell>
                    </Table.Row>
                  ))
                ) : null}
              </Table.Body>
            </Table>
            {studentData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No attendance records found
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'reports' && (
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
              <div className="flex items-center space-x-4">
                <Select
                  value={selectedTerm}
                  options={[
                    { value: 'Term 1', label: 'Term 1' },
                    { value: 'Term 2', label: 'Term 2' },
                    { value: 'Term 3', label: 'Term 3' },
                  ]}
                  onChange={(e) => {
                    setSelectedTerm(e.target.value);
                    loadReports(classGroup.id, e.target.value, selectedYear);
                  }}
                >
                </Select>
                <Select
                  value={selectedYear}
                  options={[
                    { value: '2024', label: '2024' },
                    { value: '2025', label: '2025' },
                  ]}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    loadReports(classGroup.id, selectedTerm, e.target.value);
                  }}
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </Select>
                {canFinalizeReports() && (
                  <Button onClick={handleGenerateReports}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Reports
                  </Button>
                )}
              </div>
            </div>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Student</Table.HeaderCell>
                  <Table.HeaderCell>Overall Comment</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {reportData.length > 0 ? (
                  reportData.map(report => (
                    <Table.Row key={report.id}>
                      <Table.Cell>{report.studentName}</Table.Cell>
                      <Table.Cell>{report.overallComment}</Table.Cell>
                      <Table.Cell>{report.status}</Table.Cell>
                      <Table.Cell>{report.actions}</Table.Cell>
                    </Table.Row>
                  ))
                ) : null}
              </Table.Body>
            </Table>
            {reportData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No reports found
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Attendance Modal */}
      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={closeModals}
        title="Mark Attendance"
      >
        <BulkAttendanceForm
          classGroup={{
            id: classGroup.id,
            form: classGroup.form,
            section: classGroup.section,
            academicYear: classGroup.academicYear,
            students: students
          }}
          date={selectedDate}
          onSubmit={handleMarkAttendance}
          onCancel={closeModals}
        />
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={closeModals}
        title="Report Comments"
      >
        {selectedReport && (
          <ReportCommentForm
            student={selectedReport.student}
            currentComment={selectedReport.overallComment || ''}
            isOverallComment={true}
            onSubmit={async (data) => {
              // Handle report comment submission
              closeModals();
              loadReports(classGroup.id, selectedTerm, selectedYear);
            }}
            onCancel={closeModals}
          />
        )}
      </Modal>
    </div>
  );
};

export default ClassDetailPage;