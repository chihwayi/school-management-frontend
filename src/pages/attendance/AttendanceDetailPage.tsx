import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { attendanceService } from '../../services/attendanceService';
import { studentService } from '../../services/studentService';
import type { Attendance, Student } from '../../types';
import { Card, Button, Badge, Table } from '../../components/ui';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calendar, User, Clock, TrendingUp, TrendingDown } from 'lucide-react';

const AttendanceDetailPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [student, setStudent] = useState<Student | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (studentId) {
      loadStudentAttendance();
    }
  }, [studentId]);

  const loadStudentAttendance = async () => {
    if (!studentId) return;
    
    setIsLoading(true);
    try {
      const [studentData, attendanceData] = await Promise.all([
        studentService.getStudentById(parseInt(studentId)),
        attendanceService.getAttendanceByStudent(parseInt(studentId))
      ]);

      setStudent(studentData);
      setAttendanceRecords(attendanceData);
    } catch (error) {
      toast.error('Failed to load student attendance data');
      console.error('Error loading student attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceStats = () => {
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => record.present).length;
    const absentDays = totalDays - presentDays;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    return {
      totalDays,
      presentDays,
      absentDays,
      attendanceRate
    };
  };

  const getRecentTrend = () => {
    const last10Records = attendanceRecords
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
    
    const recentPresent = last10Records.filter(record => record.present).length;
    const recentRate = last10Records.length > 0 ? (recentPresent / last10Records.length) * 100 : 0;
    
    return {
      records: last10Records,
      rate: recentRate
    };
  };

  const getAttendanceByMonth = () => {
    const monthlyData: { [key: string]: { present: number; absent: number; total: number } } = {};
    
    attendanceRecords.forEach(record => {
      const month = new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (!monthlyData[month]) {
        monthlyData[month] = { present: 0, absent: 0, total: 0 };
      }
      
      monthlyData[month].total++;
      if (record.present) {
        monthlyData[month].present++;
      } else {
        monthlyData[month].absent++;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
      rate: (data.present / data.total) * 100
    }));
  };

  const stats = getAttendanceStats();
  const recentTrend = getRecentTrend();
  const monthlyData = getAttendanceByMonth();

  const attendanceTableData = attendanceRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(record => ({
      id: record.id,
      date: new Date(record.date).toLocaleDateString(),
      status: record.present ? 'Present' : 'Absent',
      markedAt: record.markedAt ? new Date(record.markedAt).toLocaleString() : '-',
      markedBy: record.markedBy ? `${record.markedBy.firstName} ${record.markedBy.lastName}` : 'System'
    }));



  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!student) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Student not found</p>
        <Button onClick={() => navigate('/attendance')} className="mt-4">
          Back to Attendance
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/attendance')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-gray-600">
              {student.studentId} • {student.form} {student.section}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Days</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalDays}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Present Days</p>
              <p className="text-2xl font-bold text-green-600">{stats.presentDays}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Clock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Absent Days</p>
              <p className="text-2xl font-bold text-red-600">{stats.absentDays}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stats.attendanceRate >= 80 ? 'bg-green-100' : 'bg-yellow-100'}`}>
              {stats.attendanceRate >= 80 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Attendance Rate</p>
              <p className={`text-2xl font-bold ${stats.attendanceRate >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                {stats.attendanceRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Monthly Attendance Breakdown</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthlyData.map((month) => (
              <div key={month.month} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{month.month}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Present:</span>
                    <span className="font-medium text-green-600">{month.present}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Absent:</span>
                    <span className="font-medium text-red-600">{month.absent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{month.total}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Rate:</span>
                    <span className={`font-medium ${month.rate >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {month.rate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Recent Trend */}
      <Card>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Recent Attendance Trend (Last 10 Days)</h2>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600">Recent Rate:</span>
            <Badge variant={recentTrend.rate >= 80 ? 'success' : 'warning'}>
              {recentTrend.rate.toFixed(1)}%
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentTrend.records.map((record) => (
              <div
                key={record.id}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  record.present 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {new Date(record.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Detailed Attendance Records */}
      <Card>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Detailed Attendance Records</h2>
        </div>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Marked At</Table.HeaderCell>
              <Table.HeaderCell>Marked By</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {attendanceTableData.length > 0 ? (
              attendanceTableData.map(record => (
                <Table.Row key={record.id}>
                  <Table.Cell>{record.date}</Table.Cell>
                  <Table.Cell>
                    <Badge variant={record.status === 'Present' ? 'success' : 'error'}>
                      {record.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{record.markedAt}</Table.Cell>
                  <Table.Cell>{record.markedBy}</Table.Cell>
                </Table.Row>
              ))
            ) : null}
          </Table.Body>
        </Table>
        {attendanceTableData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No attendance records found
          </div>
        )}
      </Card>
    </div>
  );
};

export default AttendanceDetailPage;