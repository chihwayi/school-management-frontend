import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Button, Select, Card } from '../ui';
import type { Student, Subject, PromotionToALevelDTO } from '../../types';
import { FORMS } from '../../types';

interface StudentPromotionFormProps {
  onSubmit: (data: PromotionToALevelDTO) => Promise<void>;
  onCancel: () => void;
  students: Student[];
  subjects: Subject[];
  isLoading?: boolean;
}

const StudentPromotionForm: React.FC<StudentPromotionFormProps> = ({
  onSubmit,
  onCancel,
  students,
  subjects,
  isLoading = false
}) => {
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<{ form: string; section: string }>({
    defaultValues: {
      form: 'Form 5',
      section: 'A'
    }
  });

  const handleFormSubmit = async (data: { form: string; section: string }) => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    if (selectedSubjects.length === 0) {
      toast.error('Please select at least one subject');
      return;
    }

    try {
      const promotionData: PromotionToALevelDTO = {
        studentIds: selectedStudents,
        subjectIds: selectedSubjects,
        form: data.form,
        section: data.section
      };

      await onSubmit(promotionData);
      toast.success('Students promoted to A-Level successfully!');
      reset();
      setSelectedStudents([]);
      setSelectedSubjects([]);
    } catch (error) {
      toast.error('Failed to promote students');
    }
  };

  const handleStudentToggle = (studentId: number) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubjectToggle = (subjectId: number) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const formOptions = FORMS.A_LEVEL.map(form => ({
    value: form,
    label: form
  }));

  const sectionOptions = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'Blue', label: 'Blue' },
    { value: 'Green', label: 'Green' },
    { value: 'Red', label: 'Red' }
  ];

  // Filter eligible students (Form 4 students)
  const eligibleStudents = students.filter(student => 
    student.form === 'Form 4' && student.level === 'O_LEVEL'
  );

  // Filter A-Level subjects
  const aLevelSubjects = subjects.filter(subject => 
    subject.level === 'A_LEVEL'
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Promotion to A-Level</h4>
        <p className="text-sm text-blue-800">
          Select Form 4 students who have successfully completed their O-Level examinations 
          and are eligible for A-Level enrollment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Select
            label="Target Form"
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students Selection */}
        <Card>
          <div className="p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Select Students ({selectedStudents.length} selected)
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {eligibleStudents.length === 0 ? (
                <p className="text-gray-500 text-sm">No eligible Form 4 students found</p>
              ) : (
                eligibleStudents.map(student => (
                  <div
                    key={student.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                  >
                    <input
                      type="checkbox"
                      id={`student-${student.id}`}
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentToggle(student.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`student-${student.id}`}
                      className="flex-1 text-sm text-gray-900 cursor-pointer"
                    >
                      {student.firstName} {student.lastName} ({student.studentId})
                      <span className="text-gray-500 ml-2">
                        {student.form} {student.section}
                      </span>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Subjects Selection */}
        <Card>
          <div className="p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Select A-Level Subjects ({selectedSubjects.length} selected)
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {aLevelSubjects.length === 0 ? (
                <p className="text-gray-500 text-sm">No A-Level subjects found</p>
              ) : (
                aLevelSubjects.map(subject => (
                  <div
                    key={subject.id}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                  >
                    <input
                      type="checkbox"
                      id={`subject-${subject.id}`}
                      checked={selectedSubjects.includes(subject.id)}
                      onChange={() => handleSubjectToggle(subject.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`subject-${subject.id}`}
                      className="flex-1 text-sm text-gray-900 cursor-pointer"
                    >
                      {subject.name} ({subject.code})
                      <span className="text-gray-500 ml-2">
                        {subject.category.replace('A_LEVEL_', '').toLowerCase()}
                      </span>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-amber-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-amber-900 mb-2">Important Notes</h4>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Only Form 4 students who have passed their O-Level exams are eligible</li>
          <li>• Students will be enrolled in the selected A-Level subjects</li>
          <li>• This action cannot be undone - ensure all selections are correct</li>
          <li>• Students will receive new student IDs for A-Level</li>
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
          disabled={isLoading || selectedStudents.length === 0 || selectedSubjects.length === 0}
        >
          Promote Students to A-Level
        </Button>
      </div>
    </form>
  );
};

export default StudentPromotionForm;