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
  GraduationCap,
  PlusCircle,
  Edit,
  Eye,
  BarChart3,
  Award
} from 'lucide-react';

import { Card, Button, Badge } from '../../components/ui';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SignatureUpload from '../../components/signatures/SignatureUpload';
import { teacherService } from '../../services/teacherService';
import { useAuth } from '../../hooks/useAuth';
import { formatRoleName } from '../../utils';

const TeacherDashboard: React.FC = () => {
  const { user, school } = useAuth();

  // Fetch teacher data
  const { data: teacher, isLoading: teacherLoading } = useQuery({
    queryKey: ['current-teacher'],
    queryFn: teacherService.getCurrentTeacher,
    retry: false
  });

  // Fetch teacher assignments
  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['teacher-assignments'],
    queryFn: teacherService.getAssignedSubjectsAndClasses,
    retry: false
  });

  const isLoading = teacherLoading || assignmentsLoading;

  // Calculate stats - always call useMemo to maintain hook order
  const stats = React.useMemo(() => {
    // Ensure assignments is always an array to prevent conditional logic
    const safeAssignments = Array.isArray(assignments) ? assignments : [];

    const totalAssignments = safeAssignments.length;
    const uniqueSubjects = safeAssignments.length > 0 ?
      new Set(safeAssignments.map((a: any) => a?.subject?.id).filter(Boolean)).size : 0;
    const uniqueClasses = safeAssignments.length > 0 ?
      new Set(safeAssignments.map((a: any) => `${a.form}-${a.section}`).filter(Boolean)).size : 0;
    const totalStudents = safeAssignments.reduce((sum: number) => {
      return sum + 25;
    }, 0);

    return {
      totalAssignments,
      uniqueSubjects,
      uniqueClasses,
      totalStudents,
    };
  }, [assignments]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const quickActions = [
    {
      title: 'Record Assessment',
      description: 'Add exam or coursework marks',
      icon: <ClipboardList className="h-6 w-6" />,
      href: '/app/assessments',
      color: 'bg-green-500',
    },
    {
      title: 'View Students',
      description: 'See students in your classes',
      icon: <Users className="h-6 w-6" />,
      href: '/app/students',
      color: 'bg-blue-500',
    },
    {
      title: 'Subject Comments',
      description: 'Add comments to student reports',
      icon: <MessageSquare className="h-6 w-6" />,
      href: '/app/reports',
      color: 'bg-purple-500',
    },
    {
      title: 'My Subjects',
      description: 'View your teaching subjects',
      icon: <BookOpen className="h-6 w-6" />,
      href: '/app/teachers/my-subjects',
      color: 'bg-indigo-500',
    },
    {
      title: 'Student Reports',
      description: 'View student performance reports',
      icon: <FileText className="h-6 w-6" />,
      href: '/app/reports',
      color: 'bg-orange-500',
    },
    {
      title: 'Performance Analytics',
      description: 'Analyze class performance',
      icon: <BarChart3 className="h-6 w-6" />,
      href: '/app/reports',
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
                Welcome, {(teacher as any)?.firstName} {(teacher as any)?.lastName}
              </h1>
              <p className="text-gray-600">
                Teacher Dashboard - {school?.name}
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
              <p className="text-sm text-gray-600">Teaching Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueSubjects}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Classes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueClasses}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Assignments</p>
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

      {/* Teaching Assignments */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Teaching Assignments</h2>
          <Button size="sm" variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {Array.isArray(assignments) && assignments.length > 0 ? (
            assignments.map((assignment: any) => (
              <div key={assignment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {assignment.subjectName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Code: {assignment.subjectCode}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">
                      {assignment.form} {assignment.section}
                    </Badge>
                    <Badge variant="info">
                      {assignment.academicYear}
                    </Badge>
                  </div>
                </div>

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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = `/app/reports`}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Add Comments
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No teaching assignments yet</p>
              <p className="text-sm">Contact your administrator to get assigned to subjects and classes</p>
            </div>
          )}
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
                Welcome to your Teacher Dashboard
              </p>
              <p className="text-sm text-gray-600">
                Start by recording assessments or viewing your assigned students
              </p>
            </div>
          </div>
        </div>
      </Card>



    </div>
  );
};

export default TeacherDashboard;