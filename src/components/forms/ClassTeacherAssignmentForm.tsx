import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Button, Select } from '../ui';
import type { Teacher, ClassGroup } from '../../types';

interface ClassTeacherAssignmentFormProps {
  onSubmit: (data: { teacherId: number; classGroupId: number }) => Promise<void>;
  onCancel: () => void;
  teachers: Teacher[];
  classGroups: ClassGroup[];
  isLoading?: boolean;
}

const ClassTeacherAssignmentForm: React.FC<ClassTeacherAssignmentFormProps> = ({
  onSubmit,
  onCancel,
  teachers,
  classGroups,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<{ teacherId: number; classGroupId: number }>({
    defaultValues: {
      teacherId: 0,
      classGroupId: 0
    }
  });

  const handleFormSubmit = async (data: { teacherId: number; classGroupId: number }) => {
    try {
      console.log('Assigning teacher with data:', data);
      await onSubmit(data);
      toast.success('Class teacher assigned successfully!');
      reset();
    } catch (error) {
      console.error('Error assigning teacher:', error);
      toast.error('Failed to assign class teacher');
    }
  };

  const teacherOptions = teachers.map(teacher => ({
    value: teacher.id.toString(),
    label: `${teacher.firstName} ${teacher.lastName} (${teacher.employeeId})`
  }));

  const classGroupOptions = classGroups.map(classGroup => ({
    value: classGroup.id.toString(),
    label: `${classGroup.form} ${classGroup.section} (${classGroup.academicYear})`
  }));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Select
            label="Teacher"
            options={teacherOptions}
            error={errors.teacherId?.message}
            {...register('teacherId', {
              required: 'Teacher is required',
              setValueAs: v => Number(v)
            })}
          />
        </div>

        <div>
          <Select
            label="Class"
            options={classGroupOptions}
            error={errors.classGroupId?.message}
            {...register('classGroupId', {
              required: 'Class is required',
              setValueAs: v => Number(v)
            })}
          />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Class Teacher Responsibilities</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Mark daily attendance for all students in the class</li>
          <li>• Write overall comments on student reports after subject teachers complete their assessments</li>
          <li>• Monitor and oversee the academic progress of all students in the class</li>
          <li>• Coordinate with subject teachers regarding student performance</li>
        </ul>
      </div>

      <div className="bg-amber-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-amber-900 mb-2">Important Notes</h4>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Only one class teacher can be assigned per class</li>
          <li>• Class teacher will receive additional permissions in the system</li>
          <li>• This assignment can be changed later if needed</li>
        </ul>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
        >
          Assign Class Teacher
        </Button>
      </div>
    </form>
  );
};

export default ClassTeacherAssignmentForm;