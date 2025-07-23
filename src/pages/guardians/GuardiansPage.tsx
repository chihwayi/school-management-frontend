import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, Phone, User } from 'lucide-react';
import { WhatsAppIcon } from '../../components/common';
import { guardianService } from '../../services/guardianService';
import { studentService } from '../../services/studentService';
import { useRoleCheck } from '../../hooks/useAuth';
import type { Guardian, Student } from '../../types';
import { Button, Card, Input, Modal, Table, Badge } from '../../components/ui';
import { GuardianForm } from '../../components/forms';
import { LoadingSpinner } from '../../components/common';

const GuardiansPage: React.FC = () => {
  const { canManageStudents } = useRoleCheck();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [guardianToDelete, setGuardianToDelete] = useState<Guardian | null>(null);

  // Fetch all students
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getAllStudents,
    enabled: canManageStudents()
  });
  
  // Get studentId from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const studentId = params.get('studentId');
    
    if (studentId && students.length > 0) {
      const id = parseInt(studentId);
      // Find the student in the students list
      const student = students.find(s => s.id === id);
      if (student) {
        setSelectedStudent(student);
      }
    }
  }, [location.search, students]);

  // Fetch guardians for selected student
  const { data: guardians = [], isLoading: guardiansLoading } = useQuery({
    queryKey: ['guardians', selectedStudent?.id],
    queryFn: () => selectedStudent ? guardianService.getGuardiansByStudent(selectedStudent.id) : Promise.resolve([]),
    enabled: !!selectedStudent
  });

  // Delete guardian mutation
  const deleteGuardianMutation = useMutation({
    mutationFn: guardianService.deleteGuardian,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      toast.success('Guardian deleted successfully');
      setIsDeleteModalOpen(false);
      setGuardianToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete guardian');
    }
  });

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddGuardian = () => {
    if (!selectedStudent) {
      toast.error('Please select a student first');
      return;
    }
    setSelectedGuardian(null);
    setIsFormModalOpen(true);
    
    // Update URL to include studentId without navigating
    const params = new URLSearchParams(location.search);
    if (!params.has('studentId')) {
      params.set('studentId', selectedStudent.id.toString());
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
  };

  const handleEditGuardian = (guardian: Guardian) => {
    setSelectedGuardian(guardian);
    setIsFormModalOpen(true);
  };

  const handleDeleteGuardian = (guardian: Guardian) => {
    setGuardianToDelete(guardian);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (guardianToDelete) {
      deleteGuardianMutation.mutate(guardianToDelete.id);
    }
  };

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    setSelectedGuardian(null);
    queryClient.invalidateQueries({ queryKey: ['guardians'] });
    
    // If we came from student detail page, offer to go back
    const params = new URLSearchParams(location.search);
    if (params.get('studentId')) {
      toast.success(
        <div>
          Guardian saved! 
          <button 
            className="ml-2 underline text-blue-600" 
            onClick={() => navigate(`/app/students/${params.get('studentId')}`)}
          >
            Return to student
          </button>
        </div>,
        { duration: 5000 }
      );
    }
  };



  if (!canManageStudents()) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to manage guardians.</p>
      </div>
    );
  }

  if (studentsLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Guardian Management</h1>
        <Button onClick={handleAddGuardian} disabled={!selectedStudent}>
          <Plus className="h-4 w-4 mr-2" />
          Add Guardian
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <Card className="lg:col-span-1">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold mb-4">Students</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredStudents.map(student => (
              <div
                key={student.id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedStudent?.id === student.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => setSelectedStudent(student)}
              >
                <div className="font-medium">{student.firstName} {student.lastName}</div>
                <div className="text-sm text-gray-500">{student.studentId}</div>
                <div className="text-sm text-gray-500">{student.form} {student.section}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Guardians List */}
        <Card className="lg:col-span-2">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">
              {selectedStudent 
                ? `Guardians for ${selectedStudent.firstName} ${selectedStudent.lastName}`
                : 'Select a student to view guardians'
              }
            </h2>
          </div>
          <div className="p-4">
            {selectedStudent ? (
              guardiansLoading ? (
                <LoadingSpinner />
              ) : guardians.length > 0 ? (
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Name</Table.HeaderCell>
                      <Table.HeaderCell>Relationship</Table.HeaderCell>
                      <Table.HeaderCell>Phone</Table.HeaderCell>
                      <Table.HeaderCell>WhatsApp</Table.HeaderCell>
                      <Table.HeaderCell>Type</Table.HeaderCell>
                      <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {guardians.map(guardian => (
                      <Table.Row key={guardian.id}>
                        <Table.Cell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{guardian.name}</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge variant="info">{guardian.relationship}</Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{guardian.phoneNumber}</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center space-x-2">
                            <WhatsAppIcon className="h-4 w-4" />
                            <span>{guardian.whatsappNumber || 'N/A'}</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge variant={guardian.primaryGuardian ? "default" : "info"}>
                            {guardian.primaryGuardian ? 'Primary' : 'Secondary'}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditGuardian(guardian)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGuardian(guardian)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No guardians found for this student.
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select a student from the list to view their guardians.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Guardian Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedGuardian ? 'Edit Guardian' : 'Add Guardian'}
      >
        <GuardianForm
          guardian={selectedGuardian || undefined}
          onSubmit={async (data) => {
            if (selectedStudent) {
              if (selectedGuardian) {
                // Update existing guardian
                await guardianService.updateGuardian(selectedGuardian.id, data);
              } else {
                // Add new guardian
                await guardianService.addGuardianToStudent(selectedStudent.id, data);
              }
            }
          }}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Guardian"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this guardian?</p>
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-medium">{guardianToDelete?.name}</p>
            <p className="text-sm text-gray-600">{guardianToDelete?.relationship}</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={deleteGuardianMutation.isPending}
            >
              {deleteGuardianMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GuardiansPage;