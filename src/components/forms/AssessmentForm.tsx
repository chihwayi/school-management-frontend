import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Button, Input, Select } from '../ui';
import type { AssessmentDTO, Assessment } from '../../types';
import { AssessmentType } from '../../types';
import { formatAssessmentType } from '../../utils';

interface AssessmentFormProps {
  onSubmit: (data: AssessmentDTO) => Promise<void>;
  onCancel: () => void;
  initialData?: Assessment;
  studentSubjectId: number;
  isLoading?: boolean;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  studentSubjectId,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<AssessmentDTO>({
    defaultValues: initialData
      ? {
          studentSubjectId: initialData.studentSubject.id,
          title: initialData.title,
          date: initialData.date,
          score: initialData.score,
          maxScore: initialData.maxScore,
          type: initialData.type,
          term: initialData.term,
          academicYear: initialData.academicYear
        }
      : {
          studentSubjectId,
          title: '',
          date: new Date().toISOString().split('T')[0],
          score: 0,
          maxScore: 100,
          type: AssessmentType.COURSEWORK,
          term: 'Term 1',
          academicYear: new Date().getFullYear().toString()
        }
  });

  const handleFormSubmit = async (data: AssessmentDTO) => {
    try {
      await onSubmit(data);
      toast.success(
        initialData
          ? 'Assessment updated successfully!'
          : 'Assessment created successfully!'
      );
      reset();
    } catch (error) {
      toast.error('Failed to save assessment');
    }
  };

  const assessmentTypeOptions = [
    { value: AssessmentType.COURSEWORK, label: formatAssessmentType(AssessmentType.COURSEWORK) },
    { value: AssessmentType.FINAL_EXAM, label: formatAssessmentType(AssessmentType.FINAL_EXAM) }
  ];

  const termOptions = [
    { value: 'Term 1', label: 'Term 1' },
    { value: 'Term 2', label: 'Term 2' },
    { value: 'Term 3', label: 'Term 3' }
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
          <Input
            label="Assessment Title"
            placeholder="Enter assessment title"
            error={errors.title?.message}
            {...register('title', {
              required: 'Assessment title is required',
              minLength: {
                value: 3,
                message: 'Title must be at least 3 characters'
              }
            })}
          />
        </div>

        <div>
          <Input
            label="Date"
            type="date"
            error={errors.date?.message}
            {...register('date', {
              required: 'Date is required'
            })}
          />
        </div>

        <div>
          <Input
            label="Score"
            type="number"
            placeholder="Enter score"
            error={errors.score?.message}
            {...register('score', {
              required: 'Score is required',
              min: {
                value: 0,
                message: 'Score cannot be negative'
              },
              valueAsNumber: true
            })}
          />
        </div>

        <div>
          <Input
            label="Maximum Score"
            type="number"
            placeholder="Enter maximum score"
            error={errors.maxScore?.message}
            {...register('maxScore', {
              required: 'Maximum score is required',
              min: {
                value: 1,
                message: 'Maximum score must be at least 1'
              },
              valueAsNumber: true
            })}
          />
        </div>

        <div>
          <Select
            label="Assessment Type"
            options={assessmentTypeOptions}
            error={errors.type?.message}
            {...register('type', {
              required: 'Assessment type is required'
            })}
          />
        </div>

        <div>
          <Select
            label="Term"
            options={termOptions}
            error={errors.term?.message}
            {...register('term', {
              required: 'Term is required'
            })}
          />
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
          {initialData ? 'Update Assessment' : 'Create Assessment'}
        </Button>
      </div>
    </form>
  );
};

export default AssessmentForm;