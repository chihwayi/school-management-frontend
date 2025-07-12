import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Edit, Phone, MessageSquare, User, Calendar, Shield, ShieldCheck } from 'lucide-react';
import { guardianService } from '../../services/guardianService';
import { useRoleCheck } from '../../hooks/useAuth';
import type { Guardian } from '../../types';
import { Button, Card, Modal, Badge } from '../../components/ui';
import { GuardianForm } from '../../components/forms';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const GuardianDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canManageStudents } = useRoleCheck();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch guardian details
  const { data: guardian, isLoading } = useQuery({
    queryKey: ['guardian', id],
    queryFn: () => guardianService.getGuardianById(Number(id)),
    enabled: !!id && canManageStudents()
  });

  // Update guardian mutation
  const updateGuardianMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Guardian> }) => 
      guardianService.updateGuardian(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardian', id] });
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      toast.success('Guardian updated successfully');
      setIsEditModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update guardian');
    }
  });

  const handleFormSuccess = () => {
    setIsEditModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['guardian', id] });
  };

  if (!canManageStudents()) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to view guardian details.</p>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner />;

  if (!guardian) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Guardian not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/guardians')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Guardians</span>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Guardian Details</h1>
        </div>
        <Button onClick={() => setIsEditModalOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Guardian
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guardian Information */}
        <Card className="lg:col-span-2">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{guardian.name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={guardian.primaryGuardian ? "default" : "info"}>
                    {guardian.primaryGuardian ? 'Primary' : 'Secondary'}
                  </Badge>
                  <Badge>{guardian.relationship}</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium">{guardian.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">WhatsApp Number</p>
                      <p className="font-medium">{guardian.whatsappNumber || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guardian Type */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Guardian Type</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {guardian.primaryGuardian ? (
                      <ShieldCheck className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Shield className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Guardian Status</p>
                      <p className="font-medium">
                        {guardian.primaryGuardian ? 'Primary Guardian' : 'Secondary Guardian'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Relationship</p>
                      <p className="font-medium">{guardian.relationship}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Student Information */}
        <Card>
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">Student Information</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Student Name</p>
                <p className="font-medium">
                  {guardian.student.firstName} {guardian.student.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Student ID</p>
                <p className="font-medium">{guardian.student.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Class</p>
                <p className="font-medium">{guardian.student.form} {guardian.student.section}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Level</p>
                <p className="font-medium">{guardian.student.level}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Enrollment Date</p>
                <p className="font-medium">
                  {new Date(guardian.student.enrollmentDate).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/students/${guardian.student.id}`)}
              >
                View Student Details
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Guardian Priority Information */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Guardian Priority & Notifications</h3>
        </div>
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              {guardian.primaryGuardian ? (
                <ShieldCheck className="h-5 w-5 text-blue-600 mt-1" />
              ) : (
                <Shield className="h-5 w-5 text-gray-400 mt-1" />
              )}
              <div>
                <h4 className="font-medium text-blue-900">
                  {guardian.primaryGuardian ? 'Primary Guardian' : 'Secondary Guardian'}
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  {guardian.primaryGuardian
                    ? 'This guardian will receive all notifications and is the primary contact for emergencies.'
                    : 'This guardian will receive notifications when the primary guardian is unavailable.'
                  }
                </p>
                {guardian.whatsappNumber && (
                  <p className="text-sm text-blue-700 mt-2">
                    <strong>WhatsApp notifications:</strong> Enabled for attendance alerts and important updates.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Guardian Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Guardian"
      >
        <GuardianForm
          guardian={guardian}
          onSubmit={async (data) => {
            await updateGuardianMutation.mutateAsync({ id: guardian.id, data });
          }}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={updateGuardianMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default GuardianDetailPage;