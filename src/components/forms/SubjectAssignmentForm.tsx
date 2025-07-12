import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Button, Card, Badge } from '../ui';
import type { Student, Subject, SubjectCategory } from '../../types';
import { getSubjectCategoriesForLevel, getLevelFromForm } from '../../utils';

interface SubjectAssignmentFormProps {
  student: Student;
  availableSubjects: Subject[];
  onSubmit: (data: { studentId: number; subjectIds: number[] }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const SubjectAssignmentForm: React.FC<SubjectAssignmentFormProps> = ({
  student,
  availableSubjects,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [subjectsByCategory, setSubjectsByCategory] = useState<{
    [key: string]: Subject[]
  }>({});

  const {
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<{ subjectIds: number[] }>({
    defaultValues: {
      subjectIds: student.subjects?.map(s => s.id) || []
    }
  });

  const level = getLevelFromForm(student.form);
  const validCategories = getSubjectCategoriesForLevel(level);

  // Group subjects by category
  useEffect(() => {
    const grouped = availableSubjects
      .filter(subject => 
        subject.level === level && 
        validCategories.includes(subject.category)
      )
      .reduce((acc, subject) => {
        const category = subject.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(subject);
        return acc;
      }, {} as { [key: string]: Subject[] });

    setSubjectsByCategory(grouped);
  }, [availableSubjects, level, validCategories]);

  // Initialize selected subjects
  useEffect(() => {
    const initialSubjects = student.subjects?.map(s => s.id) || [];
    setSelectedSubjects(initialSubjects);
    setValue('subjectIds', initialSubjects);
  }, [student.subjects, setValue]);

  const handleFormSubmit = async (data: { subjectIds: number[] }) => {
    try {
      await onSubmit({
        studentId: student.id,
        subjectIds: selectedSubjects
      });
      toast.success('Subject assignments updated successfully!');
    } catch (error) {
      toast.error('Failed to update subject assignments');
    }
  };

  const handleSubjectToggle = (subjectId: number) => {
    setSelectedSubjects(prev => {
      const newSelection = prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId];
      
      setValue('subjectIds', newSelection);
      return newSelection;
    });
  };

  const getSelectedSubjectsCount = () => selectedSubjects.length;

  const getCategoryName = (category: SubjectCategory): string => {
    const categoryNames: { [key: string]: string } = {
      'O_LEVEL_LANGUAGES': 'Languages',
      'O_LEVEL_ARTS': 'Arts',
      'O_LEVEL_COMMERCIALS': 'Commercials',
      'O_LEVEL_SCIENCES': 'Sciences',
      'A_LEVEL_ARTS': 'Arts',
      'A_LEVEL_COMMERCIALS': 'Commercials',
      'A_LEVEL_SCIENCES': 'Sciences'
    };
    return categoryNames[category] || category;
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900">Assign Subjects</h3>
          <p className="mt-1 text-sm text-gray-600">
            Select subjects for {student.firstName} {student.lastName} ({student.form} {student.section})
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800">
              <p><strong>Student:</strong> {student.firstName} {student.lastName}</p>
              <p><strong>Student ID:</strong> {student.studentId}</p>
              <p><strong>Form:</strong> {student.form} {student.section}</p>
              <p><strong>Level:</strong> {level}</p>
            </div>
            <div className="text-right">
              <Badge variant="info">
                {getSelectedSubjectsCount()} Subject{getSelectedSubjectsCount() !== 1 ? 's' : ''} Selected
              </Badge>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-6">
            {Object.entries(subjectsByCategory).map(([category, subjects]) => (
              <div key={category} className="border rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  {getCategoryName(category as SubjectCategory)}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subjects.map(subject => (
                    <div
                      key={subject.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedSubjects.includes(subject.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSubjectToggle(subject.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(subject.id)}
                          onChange={() => handleSubjectToggle(subject.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {subject.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {subject.code}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(subjectsByCategory).length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No subjects available for this level.</p>
            </div>
          )}

          <div className="bg-amber-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-amber-900 mb-2">Assignment Notes</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Students must be assigned to subjects to receive assessments and grades</li>
              <li>• Subject assignments can be updated at any time during the academic year</li>
              <li>• Removing a subject will not delete existing assessment records</li>
              <li>• For A-Level students, ensure proper subject combinations are selected</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3">
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
            >
              Update Subject Assignments
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default SubjectAssignmentForm;