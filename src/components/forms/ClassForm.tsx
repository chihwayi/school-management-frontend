import React from 'react';
import { useForm } from 'react-hook-form';
import { BookOpen, Users } from 'lucide-react';
import type { ClassGroup, Teacher } from '../../types';
import { Button, Card, Select } from '../ui';
import { FORMS } from '../../types';

interface ClassFormProps {
  onSubmit: (data: Omit<ClassGroup, 'id' | 'students'>) => Promise<void>;
  teachers: Teacher[];
  sections: string[];
  initialData?: ClassGroup;
  isLoading?: boolean;
  error?: string;
}

const ClassForm: React.FC<ClassFormProps> = ({
  onSubmit,
  teachers,
  sections,
  initialData,
  isLoading,
  error
}) => {
  const currentYear = new Date().getFullYear();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<Omit<ClassGroup, 'id' | 'students'>>({
    defaultValues: initialData || {
      form: '',
      section: '',
      academicYear: currentYear.toString(),
      classTeacher: undefined
    }
  });

  const selectedForm = watch('form');
  const level = selectedForm ? (
    FORMS.O_LEVEL.includes(selectedForm) ? 'O_LEVEL' : 'A_LEVEL'
  ) : undefined;

  const handleFormSubmit = async (data: Omit<ClassGroup, 'id' | 'students'>) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const getFormOptions = () => {
    return [...FORMS.O_LEVEL, ...FORMS.A_LEVEL].map(form => ({
      value: form,
      label: form
    }));
  };

  const getTeacherOptions = () => {
    return teachers.map(teacher => ({
      value: teacher.id.toString(),
      label: `${teacher.firstName} ${teacher.lastName} (${teacher.employeeId})`
    }));
  };

  const getAcademicYearOptions = () => {
    const years = [];
    for (let year = currentYear - 2; year <= currentYear + 2; year++) {
      years.push({
        value: year.toString(),
        label: year.toString()
      });
    }
    return years;
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <BookOpen className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              {initialData ? 'Edit Class' : 'Create Class'}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Form"
              {...register('form', { required: 'Form is required' })}
              error={errors.form?.message}
              options={getFormOptions()}
              placeholder="Select form"
            />
            
            <Select
              label="Section"
              {...register('section', { required: 'Section is required' })}
              error={errors.section?.message}
              options={sections.map(section => ({ value: section, label: section }))}
              placeholder="Select section"
            />
            
            <Select
              label="Academic Year"
              {...register('academicYear', { required: 'Academic year is required' })}
              error={errors.academicYear?.message}
              options={getAcademicYearOptions()}
              placeholder="Select academic year"
            />
            
            <Select
              label="Class Teacher"
              {...register('classTeacher')}
              error={errors.classTeacher?.message}
              options={getTeacherOptions()}
              placeholder="Select class teacher (optional)"
            />
          </div>
          
          {/* Level Information */}
          {level && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-blue-400 mr-2" />
                <span className="text-sm text-blue-700">
                  Level: {level === 'O_LEVEL' ? 'O Level' : 'A Level'}
                </span>
              </div>
            </div>
          )}
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
            ? initialData ? 'Updating...' : 'Creating...' 
            : initialData ? 'Update Class' : 'Create Class'
          }
        </Button>
      </div>
    </form>
  );
};

export default ClassForm;