// src/pages/dashboard/ClassTeacherDashboard.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  FileText, 
  Calendar, 
  TrendingUp,
  MessageSquare,
  CheckCircle,
  Clock,
  Star,
  UserCheck,
  School,
  BarChart3,
  GraduationCap,
  PlusCircle,
  Edit,
  Eye
} from 'lucide-react';

import { Card, Button, Badge } from '../../components/ui';
import  LoadingSpinner  from '../../components/common/LoadingSpinner';
import SignatureUpload from '../../components/signatures/SignatureUpload';
import { teacherService } from '../../services/teacherService';
import { useAuth } from '../../hooks/useAuth';
import { formatRoleName } from '../../utils';

const ClassTeacherDashboard: React.FC = () => {
  const { user, school } = useAuth();

  // Fetch teacher data
  const { data: teacher, isLoading: teacherLoading } = useQuery({
    queryKey: ['current-teacher'],
    queryFn: teacherService.getCurrentTeacher,
    onError: (error) => {
      console.error('Error in current teacher query:', error);
    }
  });

  // Fetch teacher assignments (for subjects they teach)
  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['teacher-assignments'],
    queryFn: teacherService.getAssignedSubjectsAndClasses,
    onError: (error) => {
      console.error('Error in teacher assignments query:', error);
    }
  });

  // Fetch supervised classes (classes they are class teacher for)
  const { data: supervisedClasses, isLoading: supervisedLoading } = useQuery({
    queryKey: ['supervised-classes'],
    queryFn: teacherService.getSupervisedClasses,
    onError: (error) => {
      console.error('Error in supervised classes query:', error);
    }
  });

  const isLoading = teacherLoading || assignmentsLoading || supervisedLoading;

  // Calculate stats
  const stats = React.useMemo(() => {
    const totalAssignments = assignments?.length || 0;
    const uniqueSubjects = assignments ? new Set(assignments.map(a => a?.subjectId).filter(Boolean)).size : 0;
    const uniqueClasses = assignments ? new Set(assignments.map(a => a?.form && a?.section ? `${a.form}-${a.section}` : null).filter(Boolean)).size : 0;
    const supervisedClassesCount = supervisedClasses?.length || 0;
    const totalStudentsInSupervisedClasses = supervisedClasses ? supervisedClasses.reduce((sum, cls) => sum + (cls?.studentCount || 0), 0) : 0;
    
    return {
      totalAssignments,
      uniqueSubjects,
      uniqueClasses,
      supervisedClassesCount,
      totalStudentsInSupervisedClasses,
    };
  }, [assignments, supervisedClasses]);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  const quickActions = [
    {
      title: 'Mark Attendance',
      description: 'Record student attendance for your classes',
      icon: <UserCheck className="h-6 w-6" />,
      href: '/app/attendance',
      color: 'bg-blue-500',
    },
    {
      title: 'Record Assessment',
      description: 'Add exam or coursework marks',
      icon: <ClipboardList className="h-6 w-6" />,
      href: '/app/assessments',
      color: 'bg-green-500',
    },
    {
      title: 'View Reports',
      description: 'Review and comment on student reports',
      icon: <FileText className="h-6 w-6" />,
      href: '/app/reports',
      color: 'bg-purple-500',
    },
    {
      title: 'Overall Comments',
      description: 'Add overall comments to student reports',
      icon: <MessageSquare className="h-6 w-6" />,
      href: '/app/reports',
      color: 'bg-orange-500',
    },
    {
      title: 'Class Management',
      description: 'Manage your supervised classes',
      icon: <Users className="h-6 w-6" />,
      href: '/app/classes',
      color: 'bg-indigo-500',
    },
    {
      title: 'Subject Teaching',
      description: 'View students for subjects you teach',
      icon: <BookOpen className="h-6 w-6" />,
      href: '/app/subjects',
      color: 'bg-teal-500',
    },
  ];

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentTerm = `Term ${Math.ceil((currentDate.getMonth() + 1) / 4)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {teacher?.firstName} {teacher?.lastName}
              </h1>
              <p className="text-gray-600">
                Class Teacher Dashboard - {school?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="default">
              {formatRoleName(user?.roles?.[0])}
            </Badge>
            <Badge variant="info">
              {currentTerm} {currentYear}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Supervised Classes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.supervisedClassesCount}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <School className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Students Under Care</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudentsInSupervisedClasses}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Teaching Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueSubjects}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <ClipboardList className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      {/* Class Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supervised Classes */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Supervised Classes</h2>
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {supervisedClasses && supervisedClasses.length > 0 ? (
              supervisedClasses.map((classGroup) => (
                <div key={classGroup.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">
                      {classGroup.form} {classGroup.section}
                    </h3>
                    <Badge variant="info">
                      {classGroup.studentCount || 0} students
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Academic Year: {classGroup.academicYear}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/app/attendance?class=${classGroup.form}-${classGroup.section}`}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Mark Attendance
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/app/reports`}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View Reports
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <School className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No supervised classes assigned yet</p>
              </div>
            )}
          </div>
        </Card>

        {/* Teaching Assignments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Teaching Assignments</h2>
            <Button size="sm" variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {assignments && assignments.length > 0 ? (
              assignments.slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">
                      {assignment.subjectName || 'Unknown Subject'}
                    </h3>
                    <Badge variant="info">
                      {assignment.form || ''} {assignment.section || ''}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Subject Code: {assignment.subjectCode || 'N/A'}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/app/assessments`}
                    >
                      <ClipboardList className="h-4 w-4 mr-1" />
                      Record Assessment
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/app/students`}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      View Students
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No teaching assignments yet</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Comments Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Student Comments & Reports</h2>
          <Link to="/app/reports">
            <Button size="sm" variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Manage Reports
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-2">
              <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-blue-900">Subject Comments</h3>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              Add comments for subjects you teach across all your classes
            </p>
            <Link to="/app/reports">
              <Button size="sm" variant="outline">
                Add Subject Comments
              </Button>
            </Link>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Users className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="font-medium text-green-900">Overall Comments</h3>
            </div>
            <p className="text-sm text-green-700 mb-3">
              Add overall comments and finalize reports for your supervised classes
            </p>
            <Link to="/app/reports">
              <Button size="sm" variant="outline">
                Manage Class Reports
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Signature Upload */}
      <SignatureUpload />

      {/* Recent Activities */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-blue-100 p-2 rounded-full">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Welcome to your Class Teacher Dashboard
              </p>
              <p className="text-sm text-gray-600">
                Start by marking attendance, recording assessments, or adding student comments
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ClassTeacherDashboard;