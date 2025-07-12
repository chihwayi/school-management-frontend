import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Button, Input, Select } from '../../components/ui';
import { financialReportService } from '../../services/financialReportService';
import { feePaymentService } from '../../services/feePaymentService';
import { useRoleCheck } from '../../hooks/useAuth';
import { BarChart3, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import type { FinancialReportDTO, DailyPaymentSummaryDTO } from '../../types/feePayment';
import { getCurrentAcademicYear, getCurrentTerm } from '../../utils';

const FinancialReportsPage: React.FC = () => {
  const { isAdmin } = useRoleCheck();
  const [reportParams, setReportParams] = useState({
    term: getCurrentTerm(),
    academicYear: getCurrentAcademicYear(),
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: financialReport, refetch: refetchReport, isLoading: reportLoading } = useQuery({
    queryKey: ['financial-report', reportParams],
    queryFn: () => financialReportService.generateFinancialReport(
      reportParams.term,
      reportParams.academicYear,
      reportParams.startDate,
      reportParams.endDate
    ),
    enabled: false
  });

  const { data: dailySummary } = useQuery({
    queryKey: ['daily-summary', selectedDate],
    queryFn: () => feePaymentService.getDailyPaymentSummary(selectedDate),
    enabled: isAdmin()
  });

  const generateReport = () => {
    refetchReport();
  };

  if (!isAdmin()) {
    return <div>Access denied. Only administrators can view financial reports.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <BarChart3 className="h-8 w-8 text-blue-600" />
      </div>

      {/* Daily Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Daily Payment Summary</h2>
          <Calendar className="h-6 w-6 text-blue-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {dailySummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">${dailySummary.totalAmount}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-blue-600">{dailySummary.totalTransactions}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ${dailySummary.totalTransactions > 0 ? 
                      (dailySummary.totalAmount / dailySummary.totalTransactions).toFixed(2) : 
                      '0.00'}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Financial Report Generation */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Generate Financial Report</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Term</label>
            <Input
              value={reportParams.term}
              onChange={(e) => setReportParams({...reportParams, term: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Academic Year</label>
            <Input
              value={reportParams.academicYear}
              onChange={(e) => setReportParams({...reportParams, academicYear: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <Input
              type="date"
              value={reportParams.startDate}
              onChange={(e) => setReportParams({...reportParams, startDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <Input
              type="date"
              value={reportParams.endDate}
              onChange={(e) => setReportParams({...reportParams, endDate: e.target.value})}
            />
          </div>
        </div>

        <Button onClick={generateReport} disabled={reportLoading} useTheme>
          {reportLoading ? 'Generating...' : 'Generate Report'}
        </Button>
      </Card>

      {/* Financial Report Display */}
      {financialReport && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Collected</p>
                  <p className="text-2xl font-bold text-green-600">${financialReport.totalCollectedAmount}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Outstanding</p>
                  <p className="text-2xl font-bold text-red-600">${financialReport.totalOutstandingAmount}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Expected Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">${financialReport.totalExpectedRevenue}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </Card>
          </div>

          {/* Class Summaries */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Class Financial Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Class</th>
                    <th className="text-left p-2">Students</th>
                    <th className="text-left p-2">Full Payments</th>
                    <th className="text-left p-2">Part Payments</th>
                    <th className="text-left p-2">Non Payers</th>
                    <th className="text-left p-2">Collected</th>
                    <th className="text-left p-2">Outstanding</th>
                  </tr>
                </thead>
                <tbody>
                  {financialReport.classSummaries.map((summary) => (
                    <tr key={summary.className} className="border-b">
                      <td className="p-2 font-medium">{summary.className}</td>
                      <td className="p-2">{summary.totalStudents}</td>
                      <td className="p-2 text-green-600">{summary.fullPayments}</td>
                      <td className="p-2 text-yellow-600">{summary.partPayments}</td>
                      <td className="p-2 text-red-600">{summary.nonPayers}</td>
                      <td className="p-2 text-green-600">${summary.totalCollected}</td>
                      <td className="p-2 text-red-600">${summary.totalOutstanding}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FinancialReportsPage;