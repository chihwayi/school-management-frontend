import React, { useState, useEffect } from 'react';
import { useAuth, useRoleCheck } from '../../hooks/useAuth';
import { attendanceService } from '../../services/attendanceService';
import { teacherService } from '../../services/teacherService';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import type { Attendance, Student, ClassGroup, Teacher } from '../../types';
import { Card, Button, Input, Table, Modal, Select, Badge } from '../../components/ui';
import { BulkAttendanceForm } from '../../components/forms';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { Calendar, Users, CheckCircle, XCircle, Clock, Filter, Download } from 'lucide-react';

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const { canMarkAttendance, canViewReports } = useRoleCheck();
  
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'bulk' | 'individual'>('bulk');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterClass, setFilterClass] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadAttendanceForDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedClass) {
      loadStudentsForClass(selectedClass);
    }
  }, [selectedClass]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [teacherData, classesData] = await Promise.all([
        teacherService.getCurrentTeacher(),
        classService.getAllClassGroups()
      ]);

      setCurrentTeacher(teacherData);
      setClasses(classesData);

      // If teacher has supervised classes, set the first one as default
      if (teacherData.supervisedClasses && teacherData.supervisedClasses.length > 0) {
        const firstClass = teacherData.supervisedClasses[0];
        setSelectedClass(`${firstClass.form}-${firstClass.section}`);
      } else if (classesData.length > 0) {
        const firstClass = classesData[0];
        setSelectedClass(`${firstClass.form}-${firstClass.section}`);
      }

      await loadAttendanceForDate(selectedDate);
    } catch (error) {
      toast.error('Failed to load attendance data');
      console.error('Error loading attendance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAttendanceForDate = async (date: string) => {
    try {
      const attendance = await attendanceService.getAttendanceByDate(date);
      setAttendanceRecords(attendance);
    } catch (error) {
      console.error('Error loading attendance for date:', error);
    }
  };

  const loadStudentsForClass = async (classKey: string) => {
    try {
      const [form, section] = classKey.split('-');
      const studentsData = await studentService.getStudentsByClass(form, section);
      setStudents(studentsData);
    } catch (error) {
      toast.error('Failed to load students for class');
      console.error('Error loading students:', error);
    }
  };

  const handleMarkAttendance = async (studentId: number, present: boolean) => {
    try {
      await attendanceService.markAttendance(studentId, selectedDate, present);
      await loadAttendanceForDate(selectedDate);
      toast.success(`Attendance marked successfully`);
    } catch (error) {
      toast.error('Failed to mark attendance');
      console.error('Error marking attendance:', error);
    }
  };

  const handleBulkAttendance = async (data: { date: string; attendanceRecords: { studentId: number; present: boolean }[] }) => {
    try {
      setIsLoading(true);
      const promises = data.attendanceRecords.map(({ studentId, present }) =>
        attendanceService.markAttendance(studentId, data.date, present)
      );
      
      await Promise.all(promises);
      await loadAttendanceForDate(data.date);
      toast.success('Bulk attendance marked successfully');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to mark bulk attendance');
      console.error('Error marking bulk attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceForStudent = (studentId: number) => {
    return attendanceRecords.find(record => 
      record.student.id === studentId && 
      record.date === selectedDate
    );
  };

  const getAttendanceStats = () => {
    const todayAttendance = attendanceRecords.filter(record => record.date === selectedDate);
    const present = todayAttendance.filter(record => record.present).length;
    const absent = todayAttendance.filter(record => !record.present).length;
    const total = students.length;
    const unmarked = total - (present + absent);
    
    return { present, absent, total, unmarked };
  };

  const filteredAttendance = attendanceRecords.filter(record => {
    const matchesDate = !filterDate || record.date === filterDate;
    const matchesClass = !filterClass || 
      (record.student.form === filterClass.split('-')[0] && 
       record.student.section === filterClass.split('-')[1]);
    return matchesDate && matchesClass;
  });

  const stats = getAttendanceStats();

  const attendanceTableData = students.map(student => {
    const attendance = getAttendanceForStudent(student.id);
    return {
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      studentId: student.studentId,
      class: `${student.form} ${student.section}`,
      status: attendance ? (attendance.present ? 'Present' : 'Absent') : 'Not Marked',
      markedAt: attendance?.markedAt || '-',
      markedBy: attendance?.markedBy ? `${attendance.markedBy.firstName} ${attendance.markedBy.lastName}` : '-',
      actions: attendance ? 'Marked' : 'Pending'
    };
  });

  const attendanceTableColumns = [
    { key: 'name', label: 'Student Name' },
    { key: 'studentId', label: 'Student ID' },
    { key: 'class', label: 'Class' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => (
        <Badge 
          variant={value === 'Present' ? 'success' : value === 'Absent' ? 'error' : 'warning'}
        >
          {value}
        </Badge>
      )
    },
    { key: 'markedAt', label: 'Marked At' },
    { key: 'markedBy', label: 'Marked By' },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: string, row: any) => (
        <div className="flex gap-2">
          {canMarkAttendance() && value === 'Pending' && (
            <>
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleMarkAttendance(row.id, true)}
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleMarkAttendance(row.id, false)}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Mark and track student attendance</p>
        </div>
        {canMarkAttendance() && (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setModalType('bulk');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Bulk Attendance
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Not Marked</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.unmarked}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <label htmlFor="date" className="text-sm font-medium text-gray-700">
              Date:
            </label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <label htmlFor="class" className="text-sm font-medium text-gray-700">
              Class:
            </label>
            <Select
              id="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-auto"
              options={classes.map(cls => ({ value: `${cls.form}-${cls.section}`, label: `${cls.form} ${cls.section}` }))}
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={`${cls.form}-${cls.section}`}>
                  {cls.form} {cls.section}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <label htmlFor="filterDate" className="text-sm font-medium text-gray-700">
              Filter Date:
            </label>
            <Input
              id="filterDate"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-auto"
            />
          </div>

          {canViewReports() && (
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Implement attendance report export
                toast.success('Attendance report export feature coming soon');
              }}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          )}
        </div>
      </Card>

      {/* Attendance Table */}
      <Card>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">
            Attendance for {selectedDate} - {selectedClass || 'All Classes'}
          </h2>
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Student Name</Table.HeaderCell>
              <Table.HeaderCell>Student ID</Table.HeaderCell>
              <Table.HeaderCell>Class</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Marked At</Table.HeaderCell>
              <Table.HeaderCell>Marked By</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {attendanceTableData.length > 0 ? (
              attendanceTableData.map(record => (
                <Table.Row key={record.id}>
                  <Table.Cell>{record.name}</Table.Cell>
                  <Table.Cell>{record.studentId}</Table.Cell>
                  <Table.Cell>{record.class}</Table.Cell>
                  <Table.Cell>
                    <Badge 
                      variant={record.status === 'Present' ? 'success' : record.status === 'Absent' ? 'error' : 'warning'}
                    >
                      {record.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{record.markedAt}</Table.Cell>
                  <Table.Cell>{record.markedBy}</Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      {canMarkAttendance() && record.actions === 'Pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleMarkAttendance(record.id, true)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAttendance(record.id, false)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : null}
          </Table.Body>
        </Table>
        {attendanceTableData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No students found for the selected class
          </div>
        )}
      </Card>

      {/* Bulk Attendance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Bulk Attendance"
        size="lg"
      >
        <BulkAttendanceForm
          classGroup={{
            id: 0,
            form: selectedClass.split('-')[0] || '',
            section: selectedClass.split('-')[1] || '',
            academicYear: new Date().getFullYear().toString(),
            students: students
          }}
          date={selectedDate}
          onSubmit={handleBulkAttendance}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default AttendancePage;