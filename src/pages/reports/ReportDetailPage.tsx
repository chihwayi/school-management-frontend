import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Button, Badge } from '../../components/ui';
import { reportService } from '../../services/reportService';
import { schoolSettingsService } from '../../services/schoolSettingsService';
import { ArrowLeft, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../../components/common';

const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Fetch report data
  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ['report', id],
    queryFn: () => reportService.getReportById(Number(id)),
    enabled: !!id
  });
  
  // Fetch school settings
  const { data: schoolSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['schoolSettings'],
    queryFn: schoolSettingsService.getSchoolSettings
  });
  
  if (reportLoading || settingsLoading) {
    return <LoadingSpinner />;
  }
  
  if (!report) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Report Not Found</h1>
        <Button onClick={() => navigate('/app/reports')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/app/reports')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>
        <h1 className="text-2xl font-bold">Report Details</h1>
      </div>
      
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {report.student.firstName} {report.student.lastName}
            </h2>
            <p className="text-gray-600">
              {report.term} - {report.academicYear}
            </p>
            <p className="text-gray-600">
              Class: {report.student.form} {report.student.section}
            </p>
          </div>
          <div>
            <Badge
              variant={report.finalized ? 'success' : 'warning'}
            >
              {report.finalized ? 'Finalized' : 'In Progress'}
            </Badge>
          </div>
        </div>
        
        <div className="mt-6">
          <Button
            onClick={() => toast.success('PDF generation will be available when @react-pdf/renderer is installed')}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </Card>
      
      {/* Subject Reports Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Subject Reports</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coursework</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher Comment</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {report.subjectReports?.map((subjectReport) => (
              <tr key={subjectReport.id}>
                <td className="px-6 py-4 whitespace-nowrap">{subjectReport.subject.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{subjectReport.courseworkMark || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{subjectReport.examMark || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{subjectReport.totalMark || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{subjectReport.grade || 'N/A'}</td>
                <td className="px-6 py-4">{subjectReport.teacherComment || 'No comment'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      
      {/* Class Teacher Comment */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-2">Class Teacher's Comment</h2>
        <p className="text-gray-700">{report.overallComment || 'No comment provided'}</p>
      </Card>
      
      {/* Principal Comment */}
      {report.principalComment && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Principal's Comment</h2>
          <p className="text-gray-700">{report.principalComment}</p>
        </Card>
      )}
    </div>
  );
};

export default ReportDetailPage;