import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Button, Textarea, Card } from '../ui';
import type { SubjectCommentDTO, OverallCommentDTO, Student, Subject } from '../../types';
import { generatePerformanceComment } from '../../utils';

interface ReportCommentFormProps {
  student: Student;
  subject?: Subject;
  currentComment?: string;
  averageScore?: number;
  isOverallComment?: boolean;
  onSubmit: (data: SubjectCommentDTO | OverallCommentDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ReportCommentForm: React.FC<ReportCommentFormProps> = ({
  student,
  subject,
  currentComment = '',
  averageScore,
  isOverallComment = false,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<{ comment: string }>({
    defaultValues: {
      comment: currentComment
    }
  });

  const currentCommentValue = watch('comment');

  const handleFormSubmit = async (data: { comment: string }) => {
    try {
      if (isOverallComment) {
        await onSubmit({ comment: data.comment } as OverallCommentDTO);
        toast.success('Overall comment added successfully!');
      } else if (subject) {
        await onSubmit({ 
          subjectId: subject.id, 
          comment: data.comment 
        } as SubjectCommentDTO);
        toast.success('Subject comment added successfully!');
      }
    } catch (error) {
      toast.error('Failed to save comment');
    }
  };

  const handleGenerateComment = () => {
    if (averageScore !== undefined) {
      const generatedComment = generatePerformanceComment(averageScore);
      setValue('comment', generatedComment);
    }
  };

  const getSuggestedComments = () => {
    if (isOverallComment) {
      return [
        'Shows consistent effort across all subjects. Continue the good work.',
        'Demonstrates strong academic potential. Focus on areas that need improvement.',
        'Good overall performance. Maintain this level of dedication.',
        'Needs to improve time management and study habits.',
        'Excellent work ethic. Keep up the outstanding performance.'
      ];
    } else {
      return [
        'Shows good understanding of the subject concepts.',
        'Needs more practice in problem-solving techniques.',
        'Demonstrates excellent analytical skills.',
        'Should focus on improving written communication.',
        'Active participation in class discussions.',
        'Requires additional support in this subject area.'
      ];
    }
  };

  const handleSuggestedComment = (comment: string) => {
    setValue('comment', comment);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          {isOverallComment ? 'Overall Comment' : 'Subject Comment'}
        </h4>
        <div className="text-sm text-blue-800">
          <p><strong>Student:</strong> {student.firstName} {student.lastName} ({student.studentId})</p>
          <p><strong>Class:</strong> {student.form} {student.section}</p>
          {!isOverallComment && subject && (
            <p><strong>Subject:</strong> {subject.name} ({subject.code})</p>
          )}
          {averageScore !== undefined && (
            <p><strong>Average Score:</strong> {averageScore.toFixed(1)}%</p>
          )}
        </div>
      </div>

      <div>
        <Textarea
          label={isOverallComment ? 'Overall Comment' : 'Subject Comment'}
          placeholder={
            isOverallComment 
              ? 'Write an overall comment about the student\'s performance across all subjects...'
              : 'Write a comment about the student\'s performance in this subject...'
          }
          rows={4}
          error={errors.comment?.message}
          {...register('comment', {
            required: 'Comment is required',
            minLength: {
              value: 10,
              message: 'Comment must be at least 10 characters long'
            },
            maxLength: {
              value: 500,
              message: 'Comment cannot exceed 500 characters'
            }
          })}
        />
        <div className="mt-1 text-sm text-gray-500">
          {currentCommentValue.length}/500 characters
        </div>
      </div>

      {averageScore !== undefined && (
        <div className="flex justify-start">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateComment}
            disabled={isLoading}
          >
            Generate Comment from Score
          </Button>
        </div>
      )}

      <Card>
        <div className="p-4">
          <h5 className="text-sm font-medium text-gray-900 mb-3">Suggested Comments</h5>
          <div className="space-y-2">
            {getSuggestedComments().map((comment, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestedComment(comment)}
                className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                disabled={isLoading}
              >
                {comment}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="bg-amber-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-amber-900 mb-2">Guidelines</h4>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Be specific and constructive in your feedback</li>
          <li>• Focus on both strengths and areas for improvement</li>
          <li>• Use professional and encouraging language</li>
          <li>• Provide actionable suggestions where possible</li>
          {isOverallComment && (
            <li>• Consider the student's overall academic progress and behavior</li>
          )}
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
          Save Comment
        </Button>
      </div>
    </form>
  );
};

export default ReportCommentForm;