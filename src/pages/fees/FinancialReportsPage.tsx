import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Button, Input, Select, Table, Badge } from '../../components/ui';
import { financialReportService } from '../../services/financialReportService';
import { feePaymentService } from '../../services/feePaymentService';
import { useRoleCheck } from '../../hooks/useAuth';
import { 
  BarChart3, DollarSign, Calendar, TrendingUp, Download, FileText, 
  Users, AlertTriangle, History, PieChart, LineChart, ClipboardList 
} from 'lucide-react';
import type { 
  FinancialReportDTO, DailyPaymentSummaryDTO, StudentPaymentHistoryDTO,
  PaymentTrendDTO, ClassComparisonDTO, AuditLogDTO, FeePayment
} from '../../types/feePayment';
import { getCurrentAcademicYear, getCurrentTerm } from '../../utils';
import { exportToExcel, formatDataForExcel } from '../../utils/excelExport';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const FinancialReportsPage: React.FC = () => {
  const { isAdmin } = useRoleCheck();
  const [reportParams, setReportParams] = useState({
    term: getCurrentTerm(),
    academicYear: getCurrentAcademicYear(),
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedStudentId, setSelectedStudentId] = useState<number | undefined>();
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Main financial report
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

  // Daily summary
  const { data: dailySummary } = useQuery({
    queryKey: ['daily-summary', selectedDate],
    queryFn: () => feePaymentService.getDailyPaymentSummary(selectedDate),
    enabled: isAdmin()
  });

  // Student payment history
  const { data: studentPaymentHistory, isLoading: studentHistoryLoading } = useQuery({
    queryKey: ['student-payment-history', selectedStudentId],
    queryFn: () => financialReportService.getStudentPaymentHistory(selectedStudentId),
    enabled: isAdmin() && activeTab === 'student-history'
  });

  // Payment trends
  const { data: paymentTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['payment-trends', reportParams.startDate, reportParams.endDate],
    queryFn: () => financialReportService.getPaymentTrends(reportParams.startDate, reportParams.endDate),
    enabled: isAdmin() && activeTab === 'payment-trends'
  });

  // Class comparison
  const { data: classComparison, isLoading: classComparisonLoading } = useQuery({
    queryKey: ['class-comparison', reportParams.academicYear],
    queryFn: () => financialReportService.getClassComparison(reportParams.academicYear),
    enabled: isAdmin() && activeTab === 'class-comparison'
  });

  // Outstanding payments
  const { data: outstandingPayments, isLoading: outstandingLoading } = useQuery({
    queryKey: ['outstanding-payments', reportParams.term, reportParams.academicYear],
    queryFn: () => financialReportService.getOutstandingPayments(reportParams.term, reportParams.academicYear),
    enabled: isAdmin() && activeTab === 'outstanding'
  });

  // Audit logs
  const { data: auditLogs, isLoading: auditLogsLoading } = useQuery({
    queryKey: ['audit-logs', reportParams.startDate, reportParams.endDate],
    queryFn: () => financialReportService.getPaymentAuditLogs(reportParams.startDate, reportParams.endDate),
    enabled: isAdmin() && activeTab === 'audit-logs'
  });

  // Student search for payment history
  const { data: studentSearchResults, isLoading: studentSearchLoading } = useQuery({
    queryKey: ['student-search', studentSearchQuery],
    queryFn: () => feePaymentService.searchStudentsByName(studentSearchQuery),
    enabled: isAdmin() && activeTab === 'student-history' && studentSearchQuery.length > 2
  });

  const generateReport = () => {
    refetchReport();
  };

  // Excel export functions
  const exportSummaryToExcel = () => {
    if (!financialReport) return;
    
    // Format class summaries for Excel
    const classSummaryData = formatDataForExcel(financialReport.classSummaries, {
      'className': 'Class',
      'totalStudents': 'Total Students',
      'fullPayments': 'Full Payments',
      'partPayments': 'Part Payments',
      'nonPayers': 'Non Payers',
      'totalCollected': 'Total Collected ($)',
      'totalOutstanding': 'Outstanding ($)'
    });
    
    exportToExcel(classSummaryData, `Financial_Summary_${reportParams.term}_${reportParams.academicYear}`);
    toast.success('Financial summary exported to Excel');
  };

  const exportStudentHistoryToExcel = () => {
    if (!studentPaymentHistory) return;
    
    // Flatten the nested payment history for Excel
    const flattenedData = studentPaymentHistory.flatMap(student => 
      student.payments.map(payment => ({
        studentId: student.studentId,
        studentName: student.studentName,
        className: student.className,
        term: payment.term,
        month: payment.month,
        academicYear: payment.academicYear,
        amountPaid: payment.amountPaid,
        balance: payment.balance,
        paymentDate: payment.paymentDate,
        paymentStatus: payment.paymentStatus
      }))
    );
    
    exportToExcel(flattenedData, `Student_Payment_History_${reportParams.academicYear}`);
    toast.success('Student payment history exported to Excel');
  };

  const exportOutstandingPaymentsToExcel = () => {
    if (!outstandingPayments || outstandingPayments.length === 0) {
      toast.error('No outstanding payments data available to export');
      return;
    }
    
    try {
      const formattedData = formatDataForExcel(outstandingPayments, {
        'student.firstName': 'First Name',
        'student.lastName': 'Last Name',
        'student.studentId': 'Student ID',
        'student.form': 'Form',
        'student.section': 'Section',
        'term': 'Term',
        'academicYear': 'Academic Year',
        'monthlyFeeAmount': 'Monthly Fee ($)',
        'amountPaid': 'Amount Paid ($)',
        'balance': 'Balance ($)',
        'paymentStatus': 'Payment Status'
      });
      
      exportToExcel(formattedData, `Outstanding_Payments_${reportParams.term}_${reportParams.academicYear}`);
      toast.success('Outstanding payments exported to Excel');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data. Please try again.');
    }
  };

  const exportPaymentTrendsToExcel = () => {
    if (!paymentTrends) return;
    
    const formattedData = formatDataForExcel(paymentTrends, {
      'date': 'Date',
      'totalAmount': 'Total Amount ($)',
      'transactionCount': 'Number of Transactions'
    });
    
    exportToExcel(formattedData, `Payment_Trends_${reportParams.startDate}_to_${reportParams.endDate}`);
    toast.success('Payment trends exported to Excel');
  };

  const exportClassComparisonToExcel = () => {
    if (!classComparison || classComparison.length === 0) {
      toast.error('No data available to export');
      return;
    }
    
    const formattedData = formatDataForExcel(classComparison, {
      'className': 'Class',
      'totalStudents': 'Total Students',
      'totalCollected': 'Total Collected ($)',
      'totalOutstanding': 'Outstanding ($)',
      'collectionRate': 'Collection Rate (%)',
      'averagePaymentPerStudent': 'Average Payment Per Student ($)'
    });
    
    exportToExcel(formattedData, `Class_Comparison_${reportParams.academicYear}`);
    toast.success('Class comparison exported to Excel');
  };

  const exportAuditLogsToExcel = () => {
    if (!auditLogs) return;
    
    const formattedData = formatDataForExcel(auditLogs, {
      'id': 'Log ID',
      'action': 'Action',
      'description': 'Description',
      'performedBy': 'Performed By',
      'timestamp': 'Timestamp',
      'amount': 'Amount ($)'
    });
    
    exportToExcel(formattedData, `Audit_Logs_${reportParams.startDate}_to_${reportParams.endDate}`);
    toast.success('Audit logs exported to Excel');
  };

  // Direct export from backend
  const downloadAllPaymentsExcel = async () => {
    try {
      const blob = await financialReportService.exportAllPaymentsToExcel(
        reportParams.term, 
        reportParams.academicYear
      );
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `All_Payments_${reportParams.term}_${reportParams.academicYear}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('All payments exported to Excel');
    } catch (error) {
      toast.error('Failed to export payments');
      console.error('Export error:', error);
    }
  };

  const downloadStudentHistoryExcel = async (studentId: number) => {
    try {
      const blob = await financialReportService.exportStudentPaymentHistory(studentId);
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Student_${studentId}_Payment_History.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Student payment history exported to Excel');
    } catch (error) {
      toast.error('Failed to export student payment history');
      console.error('Export error:', error);
    }
  };

  if (!isAdmin()) {
    return <div>Access denied. Only administrators can view financial reports.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <div className="flex items-center gap-4">
          <Button 
            onClick={async () => {
              try {
                await feePaymentService.fixPaymentStatus();
                toast.success('Payment statuses have been fixed successfully');
              } catch (error) {
                console.error('Error fixing payment statuses:', error);
                toast.error('Failed to fix payment statuses');
              }
            }} 
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            Fix Payment Statuses
          </Button>
          <BarChart3 className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      {/* Report Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <Button 
          onClick={() => setActiveTab('summary')} 
          className={`${activeTab === 'summary' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Summary
        </Button>
        <Button 
          onClick={() => setActiveTab('student-history')} 
          className={`${activeTab === 'student-history' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          <History className="h-4 w-4 mr-2" />
          Student History
        </Button>
        <Button 
          onClick={() => setActiveTab('payment-trends')} 
          className={`${activeTab === 'payment-trends' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          <LineChart className="h-4 w-4 mr-2" />
          Payment Trends
        </Button>
        <Button 
          onClick={() => setActiveTab('class-comparison')} 
          className={`${activeTab === 'class-comparison' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          <PieChart className="h-4 w-4 mr-2" />
          Class Comparison
        </Button>
        <Button 
          onClick={() => setActiveTab('outstanding')} 
          className={`${activeTab === 'outstanding' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Outstanding
        </Button>
        <Button 
          onClick={() => setActiveTab('audit-logs')} 
          className={`${activeTab === 'audit-logs' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          <ClipboardList className="h-4 w-4 mr-2" />
          Audit Logs
        </Button>
      </div>

      {/* Daily Summary */}
      {activeTab === 'summary' && (
        <>
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

            <div className="flex gap-2">
              <Button onClick={generateReport} disabled={reportLoading} useTheme>
                {reportLoading ? 'Generating...' : 'Generate Report'}
              </Button>
              <Button 
                onClick={downloadAllPaymentsExcel} 
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export All Payments
              </Button>
            </div>
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Class Financial Summary</h3>
                  <Button onClick={exportSummaryToExcel} className="bg-green-600 text-white hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export to Excel
                  </Button>
                </div>
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
        </>
      )}

      {/* Student Payment History */}
      {activeTab === 'student-history' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Student Payment History</h2>
            <History className="h-6 w-6 text-blue-600" />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Search Student</label>
            <Input
              placeholder="Enter student name..."
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
            />
          </div>
          
          {studentSearchLoading && <LoadingSpinner />}
          
          {studentSearchResults && studentSearchResults.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Select Student</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {studentSearchResults.map(student => (
                  <div 
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`p-2 border rounded-md cursor-pointer ${
                      selectedStudentId === student.id ? 'bg-blue-50 border-blue-500' : ''
                    }`}
                  >
                    <p className="font-medium">{student.firstName} {student.lastName}</p>
                    <p className="text-sm text-gray-600">{student.form} - {student.section}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {studentHistoryLoading && <LoadingSpinner />}
          
          {studentPaymentHistory && studentPaymentHistory.length > 0 && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold">Payment History</h3>
                <div className="flex gap-2">
                  <Button onClick={exportStudentHistoryToExcel} className="bg-green-600 text-white hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export to Excel
                  </Button>
                  {selectedStudentId && (
                    <Button 
                      onClick={() => downloadStudentHistoryExcel(selectedStudentId)} 
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Download Detailed Report
                    </Button>
                  )}
                </div>
              </div>
              
              {studentPaymentHistory.map(student => (
                <div key={student.studentId} className="mb-6">
                  <div className="bg-gray-50 p-3 rounded-md mb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{student.studentName}</h4>
                        <p className="text-sm text-gray-600">{student.className}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Total Paid: <span className="font-medium text-green-600">${student.totalPaid}</span></p>
                        <p className="text-sm">Balance: <span className="font-medium text-red-600">${student.totalBalance}</span></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Term</th>
                          <th className="text-left p-2">Month</th>
                          <th className="text-left p-2">Academic Year</th>
                          <th className="text-left p-2">Amount Paid</th>
                          <th className="text-left p-2">Balance</th>
                          <th className="text-left p-2">Payment Date</th>
                          <th className="text-left p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.payments.map((payment, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="p-2">{payment.term}</td>
                            <td className="p-2">{payment.month}</td>
                            <td className="p-2">{payment.academicYear}</td>
                            <td className="p-2 text-green-600">${payment.amountPaid}</td>
                            <td className="p-2 text-red-600">${payment.balance}</td>
                            <td className="p-2">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                            <td className="p-2">
                              <Badge 
                                color={
                                  payment.paymentStatus === 'FULL_PAYMENT' ? 'green' : 
                                  payment.paymentStatus === 'PART_PAYMENT' ? 'yellow' : 'red'
                                }
                              >
                                {payment.paymentStatus.replace('_', ' ')}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </>
          )}
        </Card>
      )}

      {/* Payment Trends */}
      {activeTab === 'payment-trends' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Payment Trends</h2>
            <div className="flex gap-2">
              <LineChart className="h-6 w-6 text-blue-600" />
              <Button onClick={exportPaymentTrendsToExcel} className="bg-green-600 text-white hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          
          {trendsLoading && <LoadingSpinner />}
          
          {paymentTrends && paymentTrends.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Total Amount</th>
                    <th className="text-left p-2">Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentTrends.map((trend, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2">{new Date(trend.date).toLocaleDateString()}</td>
                      <td className="p-2 text-green-600">${trend.totalAmount}</td>
                      <td className="p-2">{trend.transactionCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Class Comparison */}
      {activeTab === 'class-comparison' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Class Comparison</h2>
            <div className="flex gap-2">
              <PieChart className="h-6 w-6 text-blue-600" />
              <Button onClick={exportClassComparisonToExcel} className="bg-green-600 text-white hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Academic Year</label>
            <Input
              value={reportParams.academicYear}
              onChange={(e) => setReportParams({...reportParams, academicYear: e.target.value})}
            />
          </div>
          
          {classComparisonLoading && <LoadingSpinner />}
          
          {classComparison && classComparison.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Class</th>
                    <th className="text-left p-2">Students</th>
                    <th className="text-left p-2">Total Collected</th>
                    <th className="text-left p-2">Outstanding</th>
                    <th className="text-left p-2">Collection Rate</th>
                    <th className="text-left p-2">Avg. Per Student</th>
                  </tr>
                </thead>
                <tbody>
                  {classComparison.map((cls, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2 font-medium">{cls.className}</td>
                      <td className="p-2">{cls.totalStudents}</td>
                      <td className="p-2 text-green-600">${cls.totalCollected}</td>
                      <td className="p-2 text-red-600">${cls.totalOutstanding}</td>
                      <td className="p-2">{cls.collectionRate.toFixed(1)}%</td>
                      <td className="p-2">${cls.averagePaymentPerStudent.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center bg-gray-50 rounded-md">
              <p>No class comparison data available for the selected academic year.</p>
              <p className="text-sm text-gray-500 mt-1">Try a different academic year or check if fee payments have been recorded.</p>
            </div>
          )}
        </Card>
      )}

      {/* Outstanding Payments */}
      {activeTab === 'outstanding' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Outstanding Payments</h2>
            <div className="flex gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <Button onClick={exportOutstandingPaymentsToExcel} className="bg-green-600 text-white hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          </div>
          
          {outstandingLoading && <LoadingSpinner />}
          
          {outstandingPayments && outstandingPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Student</th>
                    <th className="text-left p-2">Class</th>
                    <th className="text-left p-2">Term</th>
                    <th className="text-left p-2">Monthly Fee</th>
                    <th className="text-left p-2">Amount Paid</th>
                    <th className="text-left p-2">Balance</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {outstandingPayments.map((payment) => (
                    <tr key={payment.id} className="border-b">
                      <td className="p-2 font-medium">
                        {payment.student.firstName} {payment.student.lastName}
                      </td>
                      <td className="p-2">{payment.student.form} {payment.student.section}</td>
                      <td className="p-2">{payment.term} ({payment.academicYear})</td>
                      <td className="p-2">${payment.monthlyFeeAmount}</td>
                      <td className="p-2 text-green-600">${payment.amountPaid}</td>
                      <td className="p-2 text-red-600">${payment.balance}</td>
                      <td className="p-2">
                        <Badge 
                          color={
                            payment.paymentStatus === 'FULL_PAYMENT' ? 'green' : 
                            payment.paymentStatus === 'PART_PAYMENT' ? 'yellow' : 'red'
                          }
                        >
                          {payment.paymentStatus.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center bg-gray-50 rounded-md">
              <p>No outstanding payments found for the selected term and academic year.</p>
              <p className="text-sm text-gray-500 mt-1">Try a different term or academic year, or all payments may be complete.</p>
            </div>
          )}
        </Card>
      )}

      {/* Audit Logs */}
      {activeTab === 'audit-logs' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Payment Audit Logs</h2>
            <div className="flex gap-2">
              <ClipboardList className="h-6 w-6 text-blue-600" />
              <Button onClick={exportAuditLogsToExcel} className="bg-green-600 text-white hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          
          {auditLogsLoading && <LoadingSpinner />}
          
          {auditLogs && auditLogs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Action</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">User</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b">
                      <td className="p-2 font-medium">{log.action}</td>
                      <td className="p-2">{log.description}</td>
                      <td className="p-2">{log.performedBy}</td>
                      <td className="p-2">{log.amount ? `$${log.amount}` : '-'}</td>
                      <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default FinancialReportsPage;