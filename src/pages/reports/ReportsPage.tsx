import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useRoleCheck } from '../../hooks/useAuth';
import { reportService } from '../../services/reportService';
import { classService } from '../../services/classService';
import { teacherService } from '../../services/teacherService';
import type { Report, ClassGroup, Teacher } from '../../types';
import { Card, Button, Table, Select, Input, Badge, Modal } from '../../components/ui';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Check, 
  Clock, 
  Filter,
  Search,
  Download,
  Users,
  Calendar,
  BookOpen
} from 'lucide-react';
import { TERMS } from '../../constants';

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    canFinalizeReports, 
    canViewReports, 
    isAdmin, 
    isClerk, 
    isTeacher, 
    isClassTeacher 
  } = useRoleCheck();

  // State management
  const [reports, setReports] = useState<Report[]>([]);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [supervisedClasses, setSupervisedClasses] = useState<ClassGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  
  // Filter states
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Generate modal states
  const [generateClassId, setGenerateClassId] = useState<string>('');
  const [generateTerm, setGenerateTerm] = useState<string>('');
  const [generateYear, setGenerateYear] = useState<string>(new Date().getFullYear().toString());

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [user]);

  // Load reports when filters change
  useEffect(() => {
    if (selectedClass && selectedTerm && selectedYear) {
      loadReports();
    }
  }, [selectedClass, selectedTerm, selectedYear]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      if (isAdmin() || isClerk()) {
        // Load all class groups for admin/clerk
        const classGroupsData = await classService.getAllClassGroups();
        setClassGroups(classGroupsData);
      } else if (isClassTeacher()) {
        // Load supervised classes for class teacher
        const supervisedClassesData = await teacherService.getSupervisedClasses();
        setSupervisedClasses(supervisedClassesData);
        setClassGroups(supervisedClassesData);
      } else if (isTeacher()) {
        // Load assigned classes for regular teacher
        const assignedSubjectsData = await teacherService.getAssignedSubjectsAndClasses();
        const uniqueClasses = assignedSubjectsData.reduce((acc, assignment) => {
          const classKey = `${assignment.form}-${assignment.section}`;
          if (!acc.some(c => `${c.form}-${c.section}` === classKey)) {
            acc.push({
              id: Math.random(), // Temporary ID
              form: assignment.form,
              section: assignment.section,
              academicYear: assignment.academicYear,
              students: []
            } as ClassGroup);
          }
          return acc;
        }, [] as ClassGroup[]);
        setClassGroups(uniqueClasses);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load page data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const classId = parseInt(selectedClass);
      const reportsData = await reportService.getClassReports(classId, selectedTerm, selectedYear);
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports');
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReports = async () => {
    if (!generateClassId || !generateTerm || !generateYear) {
      toast.error('Please select class, term, and year');
      return;
    }

    try {
      setIsGenerating(true);
      const classId = parseInt(generateClassId);
      const generatedReports = await reportService.generateClassReports(classId, generateTerm, generateYear);
      
      toast.success(`Generated ${generatedReports.length} reports successfully`);
      setShowGenerateModal(false);
      
      // Refresh reports if the generated reports match current filters
      if (generateClassId === selectedClass && generateTerm === selectedTerm && generateYear === selectedYear) {
        setReports(generatedReports);
      }
    } catch (error) {
      console.error('Error generating reports:', error);
      toast.error('Failed to generate reports');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinalizeReport = async (reportId: number) => {
    try {
      await reportService.finalizeReport(reportId);
      toast.success('Report finalized successfully');
      loadReports(); // Refresh reports
    } catch (error) {
      console.error('Error finalizing report:', error);
      toast.error('Failed to finalize report');
    }
  };

  const getStatusBadge = (report: Report) => {
    if (report.finalized) {
      return <Badge variant="success" >Finalized</Badge>;
    }
    
    const hasAllSubjectComments = report.subjectReports.every(sr => sr.comment);
    const hasOverallComment = !!report.overallComment;
    
    if (hasAllSubjectComments && hasOverallComment) {
      return <Badge variant="warning" >Ready to Finalize</Badge>;
    } else if (hasAllSubjectComments) {
      return <Badge variant="info" >Awaiting Class Teacher</Badge>;
    } else {
      return <Badge variant="info" >In Progress</Badge>;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'finalized' && report.finalized) ||
      (statusFilter === 'pending' && !report.finalized);
    
    const matchesSearch = !searchTerm || 
      `${report.student.firstName} ${report.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });



  if (!canViewReports()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">You don't have permission to view reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Manage student reports and academic performance</p>
        </div>
        
        {(isAdmin() || isClerk()) && (
          <Button
            variant="primary"
            onClick={() => setShowGenerateModal(true)}
          >
            Generate Reports
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            options={[
              { value: '', label: 'Select Class' },
              ...classGroups.map(cls => ({
                value: cls.id.toString(),
                label: `${cls.form} ${cls.section}`
              }))
            ]}
          />
          
          <Select
            label="Term"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            options={[
              { value: '', label: 'Select Term' },
              ...TERMS.map(term => ({
                value: term,
                label: term
              }))
            ]}
          />
          
          <Input
            label="Academic Year"
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            min="2020"
            max="2030"
          />
          
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Reports' },
              { value: 'finalized', label: 'Finalized' },
              { value: 'pending', label: 'Pending' }
            ]}
          />
        </div>
        
        <div className="mt-4">
          <Input
            placeholder="Search by student name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Reports Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Card>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {selectedClass && selectedTerm && selectedYear 
                ? `Reports for ${classGroups.find(c => c.id.toString() === selectedClass)?.form} ${classGroups.find(c => c.id.toString() === selectedClass)?.section} - ${selectedTerm} ${selectedYear}`
                : 'Select filters to view reports'
              }
            </h2>
            <div className="text-sm text-gray-500">
              {filteredReports.length} reports
            </div>
          </div>
          
          {filteredReports.length > 0 ? (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Student</Table.HeaderCell>
                  <Table.HeaderCell>Class</Table.HeaderCell>
                  <Table.HeaderCell>Term</Table.HeaderCell>
                  <Table.HeaderCell>Subjects</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredReports.map(report => (
                  <Table.Row key={report.id}>
                    <Table.Cell>
                      <div>
                        <div className="font-medium">{report.student.firstName} {report.student.lastName}</div>
                        <div className="text-sm text-gray-500">{report.student.studentId}</div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div>{report.classGroup.form} {report.classGroup.section}</div>
                    </Table.Cell>
                    <Table.Cell>
                      <div>{report.term} {report.academicYear}</div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-sm">
                        {report.subjectReports.length} subjects
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {getStatusBadge(report)}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/reports/${report.id}`)}
                        >
                          View
                        </Button>
                        {canFinalizeReports() && !report.finalized && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleFinalizeReport(report.id)}
                          >
                            Finalize
                          </Button>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedClass && selectedTerm && selectedYear
                  ? 'No reports available for the selected filters.'
                  : 'Please select class, term, and year to view reports.'
                }
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Generate Reports Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Reports"
      >
        <div className="space-y-4">
          <Select
            label="Class"
            value={generateClassId}
            onChange={(e) => setGenerateClassId(e.target.value)}
            options={[
              { value: '', label: 'Select Class' },
              ...classGroups.map(cls => ({
                value: cls.id.toString(),
                label: `${cls.form} ${cls.section}`
              }))
            ]}
          />
          
          <Select
            label="Term"
            value={generateTerm}
            onChange={(e) => setGenerateTerm(e.target.value)}
            options={[
              { value: '', label: 'Select Term' },
              ...TERMS.map(term => ({
                value: term,
                label: term
              }))
            ]}
          />
          
          <Input
            label="Academic Year"
            type="number"
            value={generateYear}
            onChange={(e) => setGenerateYear(e.target.value)}
            min="2020"
            max="2030"
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowGenerateModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleGenerateReports}
              disabled={isGenerating}
              loading={isGenerating}
            >
              Generate Reports
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReportsPage;