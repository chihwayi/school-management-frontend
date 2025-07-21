import React from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Users } from 'lucide-react';
import type { ClassGroup, Teacher, Section } from '../../types';
import { Button, Card, Select } from '../ui';
import { FORMS } from '../../types';
import { sectionService } from '../../services/sectionService';

interface ClassFormProps {
  onSubmit: (data: Omit<ClassGroup, 'id' | 'students'>) => Promise<void>;
  teachers: Teacher[];
  initialData?: ClassGroup;
  isLoading?: boolean;
  error?: string;
  sections?: string[];
}

const ClassForm: React.FC<ClassFormProps> = ({
  onSubmit,
  teachers,
  initialData,
  isLoading,
  error
}) => {
  const { data: sections } = useQuery({
    queryKey: ['sections-active'],
    queryFn: sectionService.getActiveSections,
  });
  const currentYear = new Date().getFullYear();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<Omit<ClassGroup, 'id' | 'students'>>({
    defaultValues: initialData ? {
      form: initialData.form,
      section: initialData.section,
      academicYear: initialData.academicYear,
      classTeacherId: initialData.classTeacher?.id || undefined
    } : {
      form: '',
      section: '',
      academicYear: currentYear.toString(),
      classTeacherId: undefined
    }
  });

  const selectedForm = watch('form');
  const level = selectedForm ? (
    FORMS.JUNIOR_SECONDARY.includes(selectedForm) ? 'JUNIOR_SECONDARY' :
    FORMS.O_LEVEL.includes(selectedForm) ? 'O_LEVEL' : 'A_LEVEL'
  ) : undefined;

  const handleFormSubmit = async (data: Omit<ClassGroup, 'id' | 'students'>) => {
    try {
      // Automatically determine level based on form
      let level;
      if (FORMS.JUNIOR_SECONDARY.includes(data.form)) {
        level = 'JUNIOR_SECONDARY';
      } else if (FORMS.O_LEVEL.includes(data.form)) {
        level = 'O_LEVEL';
      } else {
        level = 'A_LEVEL';
      }
      
      // Make sure classTeacherId is properly set
      const formData = {
        ...data,
        level,
        classTeacherId: data.classTeacherId || null
      };
      
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const getFormOptions = () => {
    return [...FORMS.JUNIOR_SECONDARY, ...FORMS.O_LEVEL, ...FORMS.A_LEVEL].map(form => ({
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
              options={[
                { value: '', label: 'Select section' },
                ...(sections || []).map(section => ({ value: section.name, label: section.name }))
              ]}
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
              {...register('classTeacherId', { 
                setValueAs: v => v === '' ? null : Number(v)
              })}
              error={errors.classTeacherId?.message}
              options={[{ value: '', label: 'Select class teacher (optional)' }, ...getTeacherOptions()]}
              placeholder="Select class teacher (optional)"
            />
          </div>
          
          {/* Level Information */}
          {level && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-blue-400 mr-2" />
                <span className="text-sm text-blue-700">
                  Level: {
                    level === 'JUNIOR_SECONDARY' ? 'Junior Secondary' :
                    level === 'O_LEVEL' ? 'O Level' : 'A Level'
                  }
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