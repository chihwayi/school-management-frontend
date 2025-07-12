import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from './Sidebar';
import { ROUTES } from '../../constants';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    const titles: { [key: string]: string } = {
      [ROUTES.DASHBOARD]: 'Dashboard',
      [ROUTES.STUDENTS]: 'Students',
      [ROUTES.TEACHERS]: 'Teachers',
      [ROUTES.CLASSES]: 'Classes',
      [ROUTES.SUBJECTS]: 'Subjects',
      [ROUTES.ASSESSMENTS]: 'Assessments',
      [ROUTES.ATTENDANCE]: 'Attendance',
      [ROUTES.REPORTS]: 'Reports',
      [ROUTES.GUARDIANS]: 'Guardians',
    };
    return titles[path] || 'School Management';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" />
              </button>

              {/* Page title */}
              <div className="flex items-center">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {getPageTitle()}
                </h1>
              </div>

              {/* User menu */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-700">
                    Welcome, {user?.username}
                  </div>
                  <div className="relative">
                    <button
                      className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={logout}
                    >
                      <LogOut className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
