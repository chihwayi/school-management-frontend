import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Button, Select, Table, Badge } from '../../components/ui';
import { reportService } from '../../services/reportService';
import { schoolSettingsService } from '../../services/schoolSettingsService';
import { classGroupService } from '../../services/classGroupService';
// import { ReportCardPDF } from '../../components/reports';
import { Printer, Download, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../../components/common';
import type { Report, ClassGroup } from '../../types/report';

const ReportPrintingPage: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [selectedReports, setSelectedReports] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch class groups
  const { data: classGroups = [], isLoading: classesLoading } = useQuery({
    queryKey: ['classGroups'],
    queryFn: classGroupService.getAllClassGroups
  });

  // Fetch school settings
  const { data: schoolSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['schoolSettings'],
    queryFn: schoolSettingsService.getSchoolSettings
  });

  // Fetch reports based on filters
  const { data: reports = [], isLoading: reportsLoading, refetch } = useQuery({
    queryKey: ['reports', selectedClass, selectedTerm, selectedYear, selectedPaymentStatus],
    queryFn: async () => {
      if (!selectedClass || !selectedTerm || !selectedYear) return [];
      
      const [form, section] = selectedClass.split('-');
      const allReports = await reportService.getReportsByFormAndSection(form, section, selectedTerm, selectedYear);
      
      // Filter by payment status if needed
      if (selectedPaymentStatus === 'all') {
        return allReports;
      } else {
        return allReports.filter((report: Report) => report.paymentStatus === selectedPaymentStatus);
      }
    },
    enabled: !!(selectedClass && selectedTerm && selectedYear)
  });

  // Handle select all checkbox
  useEffect(() => {
    if (selectAll) {
      setSelectedReports(reports.map((report: Report) => report.id));
    } else {
      setSelectedReports([]);
    }
  }, [selectAll, reports]);

  // Handle individual report selection
  const toggleReportSelection = (reportId: number) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter(id => id !== reportId));
    } else {
      setSelectedReports([...selectedReports, reportId]);
    }
  };

  // Handle bulk printing
  const handleBulkPrint = () => {
    if (selectedReports.length === 0) {
      toast.error('Please select at least one report to print');
      return;
    }
    
    // In a real implementation, this would trigger printing of multiple reports
    toast.success(`Printing ${selectedReports.length} reports`);
  };

  if (classesLoading || settingsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Report Printing</h1>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleBulkPrint} 
            disabled={selectedReports.length === 0}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Selected ({selectedReports.length})
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Class</label>
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              options={[
                { value: '', label: 'Select Class' },
                ...classGroups.map((cg: ClassGroup) => ({
                  value: `${cg.form}-${cg.section}`,
                  label: `${cg.form} ${cg.section}`
                }))
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Term</label>
            <Select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              options={[
                { value: '', label: 'Select Term' },
                { value: 'Term 1', label: 'Term 1' },
                { value: 'Term 2', label: 'Term 2' },
                { value: 'Term 3', label: 'Term 3' }
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Academic Year</label>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              options={[
                { value: '', label: 'Select Year' },
                { value: '2024', label: '2024' },
                { value: '2025', label: '2025' },
                { value: '2026', label: '2026' }
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Payment Status</label>
            <Select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'FULL_PAYMENT', label: 'Full Payment' },
                { value: 'PART_PAYMENT', label: 'Part Payment' },
                { value: 'NON_PAYMENT', label: 'No Payment' }
              ]}
            />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={() => refetch()} className="bg-blue-600 text-white hover:bg-blue-700">
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </Card>

      {/* Reports Table */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Reports</h2>
          <div className="flex items-center">
            <label className="flex items-center mr-4">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={() => setSelectAll(!selectAll)}
                className="mr-2"
              />
              Select All
            </label>
          </div>
        </div>

        {reportsLoading ? (
          <LoadingSpinner />
        ) : reports.length > 0 ? (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Select</Table.HeaderCell>
                <Table.HeaderCell>Student</Table.HeaderCell>
                <Table.HeaderCell>Class</Table.HeaderCell>
                <Table.HeaderCell>Term</Table.HeaderCell>
                <Table.HeaderCell>Year</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Payment</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {reports.map((report: Report) => (
                <Table.Row key={report.id}>
                  <Table.Cell>
                    <input
                      type="checkbox"
                      checked={selectedReports.includes(report.id)}
                      onChange={() => toggleReportSelection(report.id)}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    {report.student.firstName} {report.student.lastName}
                  </Table.Cell>
                  <Table.Cell>
                    {report.student.form} {report.student.section}
                  </Table.Cell>
                  <Table.Cell>{report.term}</Table.Cell>
                  <Table.Cell>{report.academicYear}</Table.Cell>
                  <Table.Cell>
                    <Badge
                      variant={report.finalized ? 'success' : 'warning'}
                    >
                      {report.finalized ? 'Finalized' : 'In Progress'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      variant={
                        report.paymentStatus === 'FULL_PAYMENT' ? 'success' :
                        report.paymentStatus === 'PART_PAYMENT' ? 'warning' : 'error'
                      }
                    >
                      {report.paymentStatus === 'FULL_PAYMENT' ? 'Full' :
                       report.paymentStatus === 'PART_PAYMENT' ? 'Partial' : 'None'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {report.finalized && schoolSettings && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.success('PDF generation will be available when @react-pdf/renderer is installed')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {selectedClass && selectedTerm && selectedYear ? (
              'No reports found matching the selected filters.'
            ) : (
              'Please select a class, term, and academic year to view reports.'
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReportPrintingPage;