import React from 'react';
import { Card } from '../ui';
import { CheckCircle, MessageSquare, FileText, Users } from 'lucide-react';

const ReportingGuide: React.FC = () => {
  return (
    <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">Reporting Workflow Guide</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* For Teachers */}
        <div>
          <h4 className="font-medium text-blue-800 mb-3 flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            For Subject Teachers
          </h4>
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex items-start">
              <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
              <span>Record assessments (coursework & exams) for your subjects</span>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
              <span>Add subject-specific comments for each student</span>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
              <span>Comments can be added even without recorded assessments</span>
            </div>
          </div>
        </div>

        {/* For Class Teachers */}
        <div>
          <h4 className="font-medium text-blue-800 mb-3 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            For Class Teachers
          </h4>
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex items-start">
              <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
              <span>View all students in your supervised classes</span>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
              <span>Add overall comments for each student</span>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
              <span>Finalize reports when all comments are complete</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-100 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Reports combine coursework and final exam marks automatically. 
          Teachers can add comments at any time, and class teachers finalize reports for their classes.
        </p>
      </div>
    </Card>
  );
};

export default ReportingGuide;