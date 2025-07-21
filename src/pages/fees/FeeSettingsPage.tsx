import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Input, Table, Modal } from '../../components/ui';
import { useRoleCheck } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { DollarSign, Edit, Trash2, Plus } from 'lucide-react';
import { feeSettingsService } from '../../services/feeSettingsService';
import type { FeeSettings } from '../../services/feeSettingsService';
import { LEVELS } from '../../types';
import { getCurrentAcademicYear, getCurrentTerm } from '../../utils';

const FeeSettingsPage: React.FC = () => {
  const { isAdmin, isClerk } = useRoleCheck();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeSettings | null>(null);
  const [formData, setFormData] = useState<FeeSettings>({
    level: '',
    amount: 0,
    academicYear: getCurrentAcademicYear(),
    term: getCurrentTerm(),
    active: true
  });

  const { data: feeSettings, isLoading } = useQuery({
    queryKey: ['feeSettings'],
    queryFn: feeSettingsService.getAllFeeSettings,
  });

  const createMutation = useMutation({
    mutationFn: (data: FeeSettings) => feeSettingsService.createFeeSetting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeSettings'] });
      toast.success('Fee setting created successfully');
      setIsModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to create fee setting');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<FeeSettings> }) => 
      feeSettingsService.updateFeeSetting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeSettings'] });
      toast.success('Fee setting updated successfully');
      setIsModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error('Failed to update fee setting');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => feeSettingsService.deleteFeeSetting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeSettings'] });
      toast.success('Fee setting deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete fee setting');
    }
  });

  const resetForm = () => {
    setFormData({
      level: '',
      amount: 0,
      academicYear: getCurrentAcademicYear(),
      term: getCurrentTerm(),
      active: true
    });
    setEditingFee(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.level || formData.amount <= 0) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingFee?.id) {
      updateMutation.mutate({ id: editingFee.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (fee: FeeSettings) => {
    setEditingFee(fee);
    setFormData({
      level: fee.level,
      amount: fee.amount,
      academicYear: fee.academicYear,
      term: fee.term,
      active: fee.active
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this fee setting?')) {
      deleteMutation.mutate(id);
    }
  };

  if (!isAdmin() && !isClerk()) {
    return <div>Access denied. Only administrators and clerks can manage fee settings.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fee Settings</h1>
        <Button onClick={() => setIsModalOpen(true)} useTheme>
          <Plus className="w-4 h-4 mr-2" />
          Add Fee Setting
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Level</Table.HeaderCell>
                <Table.HeaderCell>Amount</Table.HeaderCell>
                <Table.HeaderCell>Academic Year</Table.HeaderCell>
                <Table.HeaderCell>Term</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {feeSettings && feeSettings.length > 0 ? (
                feeSettings.map((fee) => (
                  <Table.Row key={fee.id}>
                    <Table.Cell>{fee.level}</Table.Cell>
                    <Table.Cell>${fee.amount}</Table.Cell>
                    <Table.Cell>{fee.academicYear}</Table.Cell>
                    <Table.Cell>{fee.term}</Table.Cell>
                    <Table.Cell>
                      <span className={`px-2 py-1 rounded-full text-xs ${fee.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {fee.active ? 'Active' : 'Inactive'}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(fee)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fee.id && handleDelete(fee.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={6} className="text-center py-4">
                    No fee settings found. Please add fee settings to enable fee payments.
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingFee ? 'Edit Fee Setting' : 'Add Fee Setting'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Level</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              disabled={!!editingFee}
            >
              <option value="">Select Level</option>
              <option value={LEVELS.JUNIOR_SECONDARY}>Junior Secondary</option>
              <option value={LEVELS.O_LEVEL}>O Level</option>
              <option value={LEVELS.A_LEVEL}>A Level</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Amount ($)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Academic Year</label>
            <Input
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Term</label>
            <Input
              value={formData.term}
              onChange={(e) => setFormData({ ...formData, term: e.target.value })}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="active">Active</label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" useTheme>
              {editingFee ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeeSettingsPage;