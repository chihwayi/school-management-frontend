import React from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { User } from 'lucide-react';
import type { Student, Section } from '../../types';
import { Button, Input, Card, Select } from '../ui';
import { FORMS, LEVELS } from '../../types';
import { sectionService } from '../../services/sectionService';

interface StudentEditFormProps {
  student: Student;
  onSubmit: (data: Partial<Student>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

const StudentEditForm: React.FC<StudentEditFormProps> = ({
  student,
  onSubmit,
  onCancel,
  isLoading,
  error
}) => {
  const { data: sections } = useQuery({
    queryKey: ['sections-active'],
    queryFn: sectionService.getActiveSections,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      firstName: student.firstName,
      lastName: student.lastName,
      studentId: student.studentId,
      form: student.form,
      section: student.section,
      level: student.level
    }
  });

  const selectedLevel = watch('level');
  const availableForms = selectedLevel === LEVELS.JUNIOR_SECONDARY ? FORMS.JUNIOR_SECONDARY :
                        selectedLevel === LEVELS.O_LEVEL ? FORMS.O_LEVEL : 
                        selectedLevel === LEVELS.A_LEVEL ? FORMS.A_LEVEL : [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium">Edit Student Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              {...register('firstName', { required: 'First name is required' })}
              error={errors.firstName?.message}
            />
            
            <Input
              label="Last Name"
              {...register('lastName', { required: 'Last name is required' })}
              error={errors.lastName?.message}
            />
            
            <Input
              label="Student ID"
              {...register('studentId', { required: 'Student ID is required' })}
              error={errors.studentId?.message}
              disabled
            />
            
            <Select
              label="Level"
              {...register('level', { required: 'Level is required' })}
              error={errors.level?.message}
              options={[
                { value: LEVELS.JUNIOR_SECONDARY, label: 'Junior Secondary' },
                { value: LEVELS.O_LEVEL, label: 'O Level' },
                { value: LEVELS.A_LEVEL, label: 'A Level' }
              ]}
            />
            
            <Select
              label="Form"
              {...register('form', { required: 'Form is required' })}
              error={errors.form?.message}
              options={availableForms.map(form => ({ value: form, label: form }))}
            />
            
            <Select
              label="Section"
              {...register('section', { required: 'Section is required' })}
              error={errors.section?.message}
              options={(sections || []).map(section => ({ value: section.name, label: section.name }))}
            />
          </div>
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Student'}
        </Button>
      </div>
    </form>
  );
};

export default StudentEditForm;