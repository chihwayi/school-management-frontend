import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Button, Input, Select } from '../ui';
import type { AssessmentDTO, Assessment } from '../../types';
import { AssessmentType } from '../../types';
import { formatAssessmentType } from '../../utils';
import { teacherService } from '../../services/teacherService';
import { studentService } from '../../services/studentService';

interface AssessmentFormProps {
  onSubmit: (data: AssessmentDTO) => Promise<void>;
  onCancel: () => void;
  initialData?: Assessment;
  studentSubjectId?: number;
  isLoading?: boolean;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  studentSubjectId = 0,
  isLoading = false
}) => {
  const [teacherAssignments, setTeacherAssignments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  useEffect(() => {
    loadTeacherAssignments();
  }, []);
  
  const loadTeacherAssignments = async () => {
    try {
      const assignments = await teacherService.getAssignedSubjectsAndClasses();
      setTeacherAssignments(assignments);
      
      // If editing, find and set the matching assignment
      if (initialData) {
        const matchingAssignment = assignments.find(a => 
          a.subjectId === initialData.subjectId && 
          a.form === initialData.studentForm && 
          a.section === initialData.studentSection
        );
        if (matchingAssignment) {
          setSelectedAssignment(matchingAssignment);
          await loadStudentsForClass(initialData.studentForm, initialData.studentSection);
          // Set the selected student after students are loaded
          setTimeout(() => {
            const student = { id: initialData.studentId };
            setSelectedStudent(student);
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error loading teacher assignments:', error);
    }
  };
  
  const loadStudentsForClass = async (form: string, section: string) => {
    try {
      const studentsData = await studentService.getStudentsByClass(form, section);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };
  
  const handleAssignmentChange = (assignmentId: string) => {
    const assignment = teacherAssignments.find(a => a.id.toString() === assignmentId);
    setSelectedAssignment(assignment);
    setSelectedStudent(null); // Reset student selection
    setStudents([]); // Clear students list
    if (assignment) {
      loadStudentsForClass(assignment.form, assignment.section);
    }
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<AssessmentDTO>({
    defaultValues: initialData
      ? {
          studentId: initialData.studentId,
          subjectId: initialData.subjectId,
          title: initialData.title,
          date: initialData.date,
          score: initialData.score,
          maxScore: initialData.maxScore,
          type: initialData.type,
          term: initialData.term,
          academicYear: initialData.academicYear
        }
      : {
          studentId: 0,
          subjectId: 0,
          title: '',
          date: new Date().toISOString().split('T')[0],
          score: 0,
          maxScore: 100,
          type: AssessmentType.COURSEWORK,
          term: 'Term 1',
          academicYear: new Date().getFullYear().toString()
        }
  });
  
  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id.toString() === studentId);
    setSelectedStudent(student);
    
    if (student && selectedAssignment) {
      const subjectId = selectedAssignment.subject?.id || selectedAssignment.subjectId;
      setValue('studentId', student.id);
      setValue('subjectId', subjectId);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFormSubmit = async (data: AssessmentDTO) => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
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
          <Select
            label="Subject & Class"
            options={[
              { value: '', label: 'Select Subject & Class' },
              ...teacherAssignments.map(assignment => ({
                value: assignment.id.toString(),
                label: `${assignment.subject?.name || assignment.subjectName} - ${assignment.form} ${assignment.section}`
              }))
            ]}
            value={selectedAssignment?.id?.toString() || ''}
            onChange={(e) => handleAssignmentChange(e.target.value)}
          />
        </div>
        
        <div>
          <Select
            label="Student"
            options={[
              { value: '', label: 'Select Student' },
              ...students.map(student => ({
                value: student.id.toString(),
                label: `${student.firstName} ${student.lastName} (${student.studentId})`
              }))
            ]}
            value={selectedStudent?.id?.toString() || (initialData ? initialData.studentId.toString() : '')}
            onChange={(e) => handleStudentChange(e.target.value)}
            disabled={!selectedAssignment}
          />
        </div>
        
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
          loading={isLoading || isSubmitting}
          disabled={isSubmitting}
        >
          {initialData ? 'Update Assessment' : 'Create Assessment'}
        </Button>
      </div>
    </form>
  );
};

export default AssessmentForm;