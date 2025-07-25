import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  UserCheck,
  FileText,
  Plus,
  Eye,
  Settings,
  ClipboardList,
  UserPlus,
  BarChart3,
  School
} from 'lucide-react';

import { Card, Button } from '../../components/ui';
import  LoadingSpinner  from '../../components/common/LoadingSpinner';
import MinistryLogoUpload from '../../components/admin/MinistryLogoUpload';
import SignatureUpload from '../../components/signatures/SignatureUpload';
import { studentService } from '../../services/studentService';
import { teacherService } from '../../services/teacherService';
import { subjectService } from '../../services/subjectService';
import { classService } from '../../services/classService';
import { useAuth } from '../../hooks/useAuth';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalClasses: number;
  oLevelStudents: number;
  aLevelStudents: number;
}

const AdminDashboard: React.FC = () => {
  const { user, school } = useAuth();

  // Fetch dashboard data
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getAllStudents,
  });

  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: teacherService.getAllTeachers,
  });

  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectService.getAllSubjects,
  });

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: classService.getAllClassGroups,
  });

  const isLoading = studentsLoading || teachersLoading || subjectsLoading || classesLoading;

  // Calculate statistics
  const stats: DashboardStats = React.useMemo(() => {
    const totalStudents = students?.length || 0;
    const totalTeachers = teachers?.length || 0;
    const totalSubjects = subjects?.length || 0;
    const totalClasses = classes?.length || 0;
    
    const oLevelStudents = students?.filter(s => s.level === 'O_LEVEL').length || 0;
    const aLevelStudents = students?.filter(s => s.level === 'A_LEVEL').length || 0;

    return {
      totalStudents,
      totalTeachers,
      totalSubjects,
      totalClasses,
      oLevelStudents,
      aLevelStudents,
    };
  }, [students, teachers, subjects, classes]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const quickActions = [
    {
      title: 'Register Student',
      description: 'Add new students to the system',
      icon: <Users className="h-6 w-6" />,
      href: '/app/students',
      color: 'bg-blue-500',
    },
    {
      title: 'Register Teacher',
      description: 'Add new teachers to the system',
      icon: <UserCheck className="h-6 w-6" />,
      href: '/app/teachers',
      color: 'bg-green-500',
    },
    {
      title: 'Create Class',
      description: 'Set up new classes',
      icon: <GraduationCap className="h-6 w-6" />,
      href: '/app/classes',
      color: 'bg-purple-500',
    },
    {
      title: 'Add Subject',
      description: 'Add new subjects',
      icon: <BookOpen className="h-6 w-6" />,
      href: '/app/subjects',
      color: 'bg-orange-500',
    },
    {
      title: 'Generate Reports',
      description: 'Create student reports',
      icon: <FileText className="h-6 w-6" />,
      href: '/app/reports',
      color: 'bg-red-500',
    },
    {
      title: 'Teacher Assignments',
      description: 'Manage teacher assignments',
      icon: <Settings className="h-6 w-6" />,
      href: '/app/teachers',
      color: 'bg-indigo-500',
    },
  ];

  const managementSections = [
    {
      title: 'Student Management',
      items: [
        { name: 'All Students', href: '/app/students', icon: <Users className="h-5 w-5" />, count: stats.totalStudents },
        { name: 'Register Student', href: '/app/students', icon: <UserPlus className="h-5 w-5" /> },
        { name: 'Student Promotion', href: '/app/students', icon: <TrendingUp className="h-5 w-5" /> },
        { name: 'Guardian Management', href: '/app/guardians', icon: <Users className="h-5 w-5" /> },
      ]
    },
    {
      title: 'Teacher Management',
      items: [
        { name: 'All Teachers', href: '/app/teachers', icon: <UserCheck className="h-5 w-5" />, count: stats.totalTeachers },
        { name: 'Register Teacher', href: '/app/teachers', icon: <UserPlus className="h-5 w-5" /> },
        { name: 'Assignments', href: '/app/teachers', icon: <ClipboardList className="h-5 w-5" /> },
        { name: 'Class Teachers', href: '/app/teachers', icon: <School className="h-5 w-5" /> },
      ]
    },
    {
      title: 'Academic Management',
      items: [
        { name: 'All Classes', href: '/app/classes', icon: <GraduationCap className="h-5 w-5" />, count: stats.totalClasses },
        { name: 'All Subjects', href: '/app/subjects', icon: <BookOpen className="h-5 w-5" />, count: stats.totalSubjects },
        { name: 'Assessment Records', href: '/app/assessments', icon: <ClipboardList className="h-5 w-5" /> },
        { name: 'Attendance', href: '/app/attendance', icon: <Calendar className="h-5 w-5" /> },
      ]
    },
    {
      title: 'Reports & Analytics',
      items: [
        { name: 'Generate Reports', href: '/app/reports', icon: <FileText className="h-5 w-5" /> },
        { name: 'View Reports', href: '/app/reports', icon: <Eye className="h-5 w-5" /> },
        { name: 'Performance Analytics', href: '/app/reports', icon: <BarChart3 className="h-5 w-5" /> },
        { name: 'School Statistics', href: '/app/reports', icon: <TrendingUp className="h-5 w-5" /> },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.username}
          </h1>
          <p className="text-gray-600 mt-1">
            {school?.name} - Administrative Dashboard
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              <p className="text-xs text-gray-500 mt-1">
                O-Level: {stats.oLevelStudents}, A-Level: {stats.aLevelStudents}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTeachers}</p>
              <p className="text-xs text-gray-500 mt-1">
                Active teaching staff
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
              <p className="text-xs text-gray-500 mt-1">
                Active class groups
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubjects}</p>
              <p className="text-xs text-gray-500 mt-1">
                Available subjects
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className={`${action.color} p-2 rounded-lg text-white`}>
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {managementSections.map((section, sectionIndex) => (
          <Card key={sectionIndex} className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{section.title}</h3>
            <div className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <Link key={itemIndex} to={item.href}>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-400">
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className="text-sm font-medium text-gray-500">{item.count}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Admin Uploads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MinistryLogoUpload />
        <SignatureUpload />
      </div>

      {/* Recent Activity Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {((stats.oLevelStudents / stats.totalStudents) * 100 || 0).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">O-Level Students</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {((stats.aLevelStudents / stats.totalStudents) * 100 || 0).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">A-Level Students</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalClasses > 0 ? (stats.totalStudents / stats.totalClasses).toFixed(1) : '0'}
            </div>
            <div className="text-sm text-gray-600">Avg. Students per Class</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;