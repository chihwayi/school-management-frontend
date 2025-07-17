import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Button, Input, Table, Modal } from '../../components/ui';
import { sectionService } from '../../services/sectionService';
import { useRoleCheck } from '../../hooks/useAuth';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Section } from '../../types/section';

const SectionsPage: React.FC = () => {
  const { canManageStudents } = useRoleCheck();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true
  });

  const { data: sections, isLoading, refetch } = useQuery({
    queryKey: ['sections'],
    queryFn: sectionService.getAllSections,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedSection) {
        await sectionService.updateSection(selectedSection.id, formData);
        toast.success('Section updated successfully');
      } else {
        await sectionService.createSection(formData);
        toast.success('Section created successfully');
      }
      setIsModalOpen(false);
      setSelectedSection(null);
      setFormData({ name: '', description: '', active: true });
      refetch();
    } catch (error) {
      toast.error('Failed to save section');
    }
  };

  const handleEdit = (section: Section) => {
    setSelectedSection(section);
    setFormData({
      name: section.name,
      description: section.description || '',
      active: section.active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await sectionService.deleteSection(id);
        toast.success('Section deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete section');
      }
    }
  };

  const filteredSections = sections?.filter(section =>
    section.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!canManageStudents()) {
    return <div>Access denied.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sections Management</h1>
        <Button onClick={() => setIsModalOpen(true)} useTheme>
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      <Card className="p-4">
        <Input
          placeholder="Search sections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Description</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredSections.map((section) => (
                <Table.Row key={section.id}>
                  <Table.Cell>{section.name}</Table.Cell>
                  <Table.Cell>{section.description || '-'}</Table.Cell>
                  <Table.Cell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      section.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {section.active ? 'Active' : 'Inactive'}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(section)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(section.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSection(null);
          setFormData({ name: '', description: '', active: true });
        }}
        title={selectedSection ? 'Edit Section' : 'Add Section'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm font-medium">Active</label>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" useTheme>
              {selectedSection ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SectionsPage;