import React, { useState, useEffect } from 'react';
import { useAuth, useRoleCheck } from '../../hooks/useAuth';
import { subjectService } from '../../services/subjectService';
import { SubjectCategory } from '../../types';
import type { Subject } from '../../types';
import { Card, Button, Input, Table, Modal, Select, Badge } from '../../components/ui';
import { SubjectForm } from '../../components/forms';
import { Plus, Search, Edit, Trash2, Eye, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { SUBJECT_CATEGORIES } from '../../types';

const SubjectsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { canManageSubjects } = useRoleCheck();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadSubjects();
    }
  }, [isAuthenticated]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectService.getAllSubjects();
      setSubjects(data);
    } catch (error) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (subjectId: number) => {
    if (window.confirm('Are you sure you want to delete this subject? This action cannot be undone.')) {
      try {
        await subjectService.deleteSubject(subjectId);
        toast.success('Subject deleted successfully');
        loadSubjects();
      } catch (error) {
        toast.error('Failed to delete subject');
      }
    }
  };

  const handleCreateSubject = () => {
    setSelectedSubject(null);
    setIsModalOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const handleSubjectSubmit = async (subjectData: Omit<Subject, 'id'>) => {
    try {
      if (selectedSubject) {
        await subjectService.updateSubject(selectedSubject.id, subjectData);
        toast.success('Subject updated successfully');
      } else {
        await subjectService.createSubject(subjectData);
        toast.success('Subject created successfully');
      }
      setIsModalOpen(false);
      loadSubjects();
    } catch (error) {
      toast.error(selectedSubject ? 'Failed to update subject' : 'Failed to create subject');
    }
  };

  const handleViewSubject = (subjectId: number) => {
    navigate(`/app/subjects/${subjectId}`);
  };

  const getCategoryBadgeColor = (category: SubjectCategory): string => {
    switch (category) {
      case SubjectCategory.JUNIOR_SECONDARY_LANGUAGES:
      case SubjectCategory.O_LEVEL_LANGUAGES:
      case SubjectCategory.A_LEVEL_ARTS:
        return 'bg-blue-100 text-blue-800';
      case SubjectCategory.JUNIOR_SECONDARY_ARTS:
      case SubjectCategory.O_LEVEL_ARTS:
      case SubjectCategory.A_LEVEL_ARTS:
        return 'bg-purple-100 text-purple-800';
      case SubjectCategory.O_LEVEL_COMMERCIALS:
      case SubjectCategory.A_LEVEL_COMMERCIALS:
        return 'bg-green-100 text-green-800';
      case SubjectCategory.JUNIOR_SECONDARY_SCIENCES:
      case SubjectCategory.O_LEVEL_SCIENCES:
      case SubjectCategory.A_LEVEL_SCIENCES:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelBadgeColor = (level: string): string => {
    switch (level) {
      case 'JUNIOR_SECONDARY':
        return 'bg-teal-100 text-teal-800';
      case 'O_LEVEL':
        return 'bg-indigo-100 text-indigo-800';
      case 'A_LEVEL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !levelFilter || subject.level === levelFilter;
    const matchesCategory = !categoryFilter || subject.category === categoryFilter;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });



  const levelOptions = [
    { value: '', label: 'All Levels' },
    { value: 'JUNIOR_SECONDARY', label: 'Junior Secondary' },
    { value: 'O_LEVEL', label: 'O Level' },
    { value: 'A_LEVEL', label: 'A Level' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: SubjectCategory.JUNIOR_SECONDARY_LANGUAGES, label: 'Junior Secondary Languages' },
    { value: SubjectCategory.JUNIOR_SECONDARY_ARTS, label: 'Junior Secondary Arts' },
    { value: SubjectCategory.JUNIOR_SECONDARY_SCIENCES, label: 'Junior Secondary Sciences' },
    { value: SubjectCategory.O_LEVEL_LANGUAGES, label: 'O Level Languages' },
    { value: SubjectCategory.O_LEVEL_ARTS, label: 'O Level Arts' },
    { value: SubjectCategory.O_LEVEL_COMMERCIALS, label: 'O Level Commercials' },
    { value: SubjectCategory.O_LEVEL_SCIENCES, label: 'O Level Sciences' },
    { value: SubjectCategory.A_LEVEL_ARTS, label: 'A Level Arts' },
    { value: SubjectCategory.A_LEVEL_COMMERCIALS, label: 'A Level Commercials' },
    { value: SubjectCategory.A_LEVEL_SCIENCES, label: 'A Level Sciences' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600">Manage school subjects and their configurations</p>
        </div>
        {canManageSubjects() && (
          <Button onClick={handleCreateSubject} className="flex items-center space-x-2" useTheme>
            <Plus className="h-4 w-4" />
            <span>Add Subject</span>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-teal-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Junior Secondary</p>
              <p className="text-2xl font-bold text-gray-900">
                {subjects.filter(s => s.level === 'JUNIOR_SECONDARY').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">O Level Subjects</p>
              <p className="text-2xl font-bold text-gray-900">
                {subjects.filter(s => s.level === 'O_LEVEL').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">A Level Subjects</p>
              <p className="text-2xl font-bold text-gray-900">
                {subjects.filter(s => s.level === 'A_LEVEL').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(subjects.map(s => s.category)).size}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Subjects
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Level
            </label>
            <Select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              options={levelOptions}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={categoryOptions}
            />
          </div>
        </div>
      </Card>

      {/* Subjects Table */}
      <Card>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Subject Code</Table.HeaderCell>
              <Table.HeaderCell>Subject Name</Table.HeaderCell>
              <Table.HeaderCell>Level</Table.HeaderCell>
              <Table.HeaderCell>Category</Table.HeaderCell>
              <Table.HeaderCell>Description</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map(subject => (
                <Table.Row key={subject.id}>
                  <Table.Cell>
                    <div className="font-medium text-gray-900">{subject.code}</div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="font-medium text-gray-900">{subject.name}</div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge className={getLevelBadgeColor(subject.level)}>
                      {subject.level.replace('_', ' ')}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge className={getCategoryBadgeColor(subject.category)}>
                      {SUBJECT_CATEGORIES[subject.category]}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-gray-600 truncate max-w-xs">
                      {subject.description || 'No description'}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewSubject(subject.id)}
                        className="p-2"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canManageSubjects() && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSubject(subject)}
                            className="p-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSubject(subject.id)}
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : null}
          </Table.Body>
        </Table>
        {filteredSubjects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No subjects found
          </div>
        )}
      </Card>

      {/* Subject Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSubject ? 'Edit Subject' : 'Create New Subject'}
      >
        <SubjectForm
          initialData={selectedSubject || undefined}
          onSubmit={handleSubjectSubmit}
        />
      </Modal>
    </div>
  );
};

export default SubjectsPage;