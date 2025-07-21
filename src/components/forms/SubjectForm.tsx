import React from 'react';
import { useForm } from 'react-hook-form';
import { BookOpen, Tag } from 'lucide-react';
import type { Subject } from '../../types';
import { SubjectCategory } from '../../types';
import { Button, Input, Card, Select, Textarea } from '../ui';
import { getSubjectCategoriesForLevel } from '../../utils';

interface SubjectFormProps {
  onSubmit: (data: Omit<Subject, 'id'>) => Promise<void>;
  initialData?: Subject;
  isLoading?: boolean;
  error?: string;
}

const SubjectForm: React.FC<SubjectFormProps> = ({
  onSubmit,
  initialData,
  isLoading,
  error
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<Omit<Subject, 'id'>>({
    defaultValues: initialData || {
      name: '',
      code: '',
      category: SubjectCategory.O_LEVEL_SCIENCES,
      level: 'O_LEVEL',
      description: ''
    }
  });

  const selectedLevel = watch('level');
  const availableCategories = getSubjectCategoriesForLevel(selectedLevel as 'JUNIOR_SECONDARY' | 'O_LEVEL' | 'A_LEVEL');

  const handleFormSubmit = async (data: Omit<Subject, 'id'>) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const getCategoryOptions = () => {
    return availableCategories;
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <BookOpen className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              {initialData ? 'Edit Subject' : 'Add Subject'}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Subject Name"
              {...register('name', { required: 'Subject name is required' })}
              error={errors.name?.message}
              placeholder="e.g., Mathematics"
              leftIcon={<BookOpen className="h-4 w-4 text-gray-400" />}
            />
            
            <Input
              label="Subject Code"
              {...register('code', { 
                required: 'Subject code is required',
                pattern: {
                  value: /^[A-Z0-9]{3,6}$/,
                  message: 'Subject code must be 3-6 uppercase letters/numbers'
                }
              })}
              error={errors.code?.message}
              placeholder="e.g., MATH"
              leftIcon={<Tag className="h-4 w-4 text-gray-400" />}
            />
            
            <Select
              label="Level"
              {...register('level', { required: 'Level is required' })}
              error={errors.level?.message}
              options={[
                { value: 'JUNIOR_SECONDARY', label: 'Junior Secondary' },
                { value: 'O_LEVEL', label: 'O Level' },
                { value: 'A_LEVEL', label: 'A Level' }
              ]}
              placeholder="Select level"
            />
            
            <Select
              label="Category"
              {...register('category', { required: 'Category is required' })}
              error={errors.category?.message}
              options={getCategoryOptions()}
              placeholder="Select category"
            />
          </div>
          
          <div className="mt-4">
            <Textarea
              label="Description"
              {...register('description')}
              error={errors.description?.message}
              placeholder="Enter subject description (optional)"
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto"
        >
          {isLoading 
            ? initialData ? 'Updating...' : 'Adding...' 
            : initialData ? 'Update Subject' : 'Add Subject'
          }
        </Button>
      </div>
    </form>
  );
};

export default SubjectForm;