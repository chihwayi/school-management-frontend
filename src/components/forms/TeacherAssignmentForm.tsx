import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Button, Select } from '../ui';
import type { TeacherAssignmentDTO, Teacher, Subject } from '../../types';
import { FORMS, LEVELS } from '../../types';

interface TeacherAssignmentFormProps {
  onSubmit: (data: TeacherAssignmentDTO) => Promise<void>;
  onCancel: () => void;
  teachers: Teacher[];
  subjects: Subject[];
  isLoading?: boolean;
}

const TeacherAssignmentForm: React.FC<TeacherAssignmentFormProps> = ({
  onSubmit,
  onCancel,
  teachers,
  subjects,
  isLoading = false
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [availableForms, setAvailableForms] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<TeacherAssignmentDTO>({
    defaultValues: {
      teacherId: 0,
      subjectId: 0,
      form: '',
      section: '',
      academicYear: new Date().getFullYear().toString()
    }
  });

  const watchedForm = watch('form');
  const watchedSubject = watch('subjectId');

  // Update available forms when level changes
  useEffect(() => {
    if (selectedLevel === LEVELS.O_LEVEL) {
      setAvailableForms(FORMS.O_LEVEL);
    } else if (selectedLevel === LEVELS.A_LEVEL) {
      setAvailableForms(FORMS.A_LEVEL);
    } else {
      setAvailableForms([]);
    }
  }, [selectedLevel]);

  // Update available subjects when form changes
  useEffect(() => {
    if (watchedForm) {
      const level = FORMS.O_LEVEL.includes(watchedForm) ? 'O_LEVEL' : 'A_LEVEL';
      const filteredSubjects = subjects.filter(subject => subject.level === level);
      setAvailableSubjects(filteredSubjects);
    }
  }, [watchedForm, subjects]);

  // Set level when form changes
  useEffect(() => {
    if (watchedForm) {
      if (FORMS.O_LEVEL.includes(watchedForm)) {
        setSelectedLevel(LEVELS.O_LEVEL);
      } else if (FORMS.A_LEVEL.includes(watchedForm)) {
        setSelectedLevel(LEVELS.A_LEVEL);
      }
    }
  }, [watchedForm]);

  const handleFormSubmit = async (data: TeacherAssignmentDTO) => {
    try {
      await onSubmit(data);
      toast.success('Teacher assignment created successfully!');
      reset();
    } catch (error) {
      toast.error('Failed to create teacher assignment');
    }
  };

  const teacherOptions = teachers.map(teacher => ({
    value: teacher.id.toString(),
    label: `${teacher.firstName} ${teacher.lastName} (${teacher.employeeId})`
  }));

  const subjectOptions = availableSubjects.map(subject => ({
    value: subject.id.toString(),
    label: `${subject.name} (${subject.code})`
  }));

  const formOptions = [...FORMS.O_LEVEL, ...FORMS.A_LEVEL].map(form => ({
    value: form,
    label: form
  }));

  const sectionOptions = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' },
    { value: 'Blue', label: 'Blue' },
    { value: 'Green', label: 'Green' },
    { value: 'Red', label: 'Red' },
    { value: 'Yellow', label: 'Yellow' }
  ];

  const currentYear = new Date().getFullYear();
  const academicYearOptions = [
    { value: currentYear.toString(), label: currentYear.toString() },
    { value: (currentYear + 1).toString(), label: (currentYear + 1).toString() }
  ];

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
              valueAsNumber: true
            })}
          />
        </div>

        <div>
          <Select
            label="Form"
            options={formOptions}
            error={errors.form?.message}
            {...register('form', {
              required: 'Form is required'
            })}
          />
        </div>

        <div>
          <Select
            label="Section"
            options={sectionOptions}
            error={errors.section?.message}
            {...register('section', {
              required: 'Section is required'
            })}
          />
        </div>

        <div>
          <Select
            label="Subject"
            options={subjectOptions}
            error={errors.subjectId?.message}
            disabled={!watchedForm}
            {...register('subjectId', {
              required: 'Subject is required',
              valueAsNumber: true
            })}
          />
          {!watchedForm && (
            <p className="text-sm text-gray-500 mt-1">
              Please select a form first
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <Select
            label="Academic Year"
            options={academicYearOptions}
            error={errors.academicYear?.message}
            {...register('academicYear', {
              required: 'Academic year is required'
            })}
          />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Assignment Summary</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>Level: {selectedLevel ? (selectedLevel === 'O_LEVEL' ? 'O Level' : 'A Level') : 'Not selected'}</p>
          <p>Available Subjects: {availableSubjects.length}</p>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isLoading}
        >
          Create Assignment
        </Button>
      </div>
    </form>
  );
};

export default TeacherAssignmentForm;