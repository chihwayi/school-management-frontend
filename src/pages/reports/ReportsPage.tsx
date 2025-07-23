import React from 'react';
import { ReportPrintingPage } from './index';

const ReportsPage: React.FC = () => {

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports</h1>
      </div>
      
      {/* Use the ReportPrintingPage component directly */}
      <ReportPrintingPage />
    </div>
  );
};

export default ReportsPage;