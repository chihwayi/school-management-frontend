import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { SchoolSetupForm } from '../../components/forms';
import { useSchoolStore } from '../../store/schoolStore';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { GraduationCap, Settings, School } from 'lucide-react';

const SchoolSetupPage: React.FC = () => {
  const { isConfigured: isSchoolConfigured, setupSchool, isLoading: setupLoading, error, checkSchoolConfig } = useSchoolStore();
  const { resetAuth } = useAuth();
  
  // Clear auth data once on mount
  useEffect(() => {
    // Clear any cached auth data
    resetAuth();
    // No need to check school config here as it's already checked in App.tsx
  }, []);

  if (setupLoading) {
    return <LoadingSpinner />;
  }

  if (isSchoolConfigured) {
    return <Navigate to="/login" replace />;
  }

  const handleSchoolSetup = async (data: any, logo?: File, background?: File) => {
    await setupSchool(data, logo, background);
    // The store will update isConfigured, triggering redirect
  }

  const handleRefresh = () => {
    // Manual refresh if needed
    checkSchoolConfig();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
            <School className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your School Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let's get your school configured with basic information, branding, and colors 
            to personalize your management experience.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <GraduationCap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Student Management
            </h3>
            <p className="text-gray-600 text-sm">
              Register and manage students, track their progress, and maintain comprehensive records.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <Settings className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Academic Tracking
            </h3>
            <p className="text-gray-600 text-sm">
              Record assessments, manage attendance, and generate comprehensive reports.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <School className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Complete Administration
            </h3>
            <p className="text-gray-600 text-sm">
              Manage teachers, classes, subjects, and all administrative tasks in one place.
            </p>
          </div>
        </div>

        {/* Setup Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              School Configuration
            </h2>
            <p className="text-gray-600">
              Please provide the following information to set up your school's profile.
            </p>
          </div>
          
          <SchoolSetupForm onSubmit={handleSchoolSetup} isLoading={setupLoading} error={error} />
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            This information can be updated later from the admin dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SchoolSetupPage;