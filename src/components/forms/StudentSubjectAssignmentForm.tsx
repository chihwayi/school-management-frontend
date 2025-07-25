import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { studentService } from '../../services/studentService';
import { subjectService } from '../../services/subjectService';
import { classGroupService } from '../../services/classGroupService';
import type { Student, Subject, ClassGroup } from '../../types';

interface AssignmentFormData {
  assignmentType: 'SINGLE' | 'BULK_CLASS' | 'BULK_CUSTOM';
  studentIds: number[];
  subjectIds: number[];
  form: string;
  section: string;
  academicYear: string;
}

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
  preselectedStudents?: Student[];
  preselectedClass?: { form: string; section: string };
}

export const StudentSubjectAssignmentForm: React.FC<Props> = ({
  onSuccess,
  onCancel,
  preselectedStudents,
  preselectedClass
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AssignmentFormData>({
    defaultValues: {
      assignmentType: preselectedStudents?.length === 1 ? 'SINGLE' : 
                     preselectedClass ? 'BULK_CLASS' : 'BULK_CUSTOM',
      studentIds: preselectedStudents?.map(s => s.id) || [],
      subjectIds: [],
      form: preselectedClass?.form || '',
      section: preselectedClass?.section || '',
      academicYear: new Date().getFullYear().toString()
    }
  });

  const assignmentType = watch('assignmentType');
  const selectedForm = watch('form');
  const selectedSection = watch('section');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (assignmentType === 'BULK_CLASS' && selectedForm && selectedSection) {
      loadClassStudents(selectedForm, selectedSection);
    }
  }, [assignmentType, selectedForm, selectedSection]);

  const loadInitialData = async () => {
    try {
      const [studentsData, subjectsData, classGroupsData] = await Promise.all([
        studentService.getAllStudents(),
        subjectService.getAllSubjects(),
        classGroupService.getAllClassGroups()
      ]);
      
      setStudents(studentsData);
      setSubjects(subjectsData);
      setClassGroups(classGroupsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoadingData(false);
    }
  };

  const loadClassStudents = async (form: string, section: string) => {
    try {
      const classStudentsData = await studentService.getStudentsByClass(form, section);
      setClassStudents(classStudentsData);
    } catch (error) {
      toast.error('Failed to load class students');
    }
  };

  const onSubmit = async (data: AssignmentFormData) => {
    setLoading(true);
    try {
      await studentService.assignSubjects({
        studentIds: data.assignmentType === 'BULK_CLASS' ? undefined : data.studentIds,
        subjectIds: data.subjectIds,
        form: data.assignmentType === 'BULK_CLASS' ? data.form : undefined,
        section: data.assignmentType === 'BULK_CLASS' ? data.section : undefined,
        academicYear: data.academicYear,
        assignmentType: data.assignmentType
      });

      toast.success('Subjects assigned successfully');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign subjects');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  const uniqueClasses = classGroups ? Array.from(
    new Set(classGroups.map(cg => `${cg.form}-${cg.section}`))
  ).map(classKey => {
    const [form, section] = classKey.split('-');
    return { form, section };
  }) : [];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Assign Subjects to Students</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Assignment Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Assignment Type</label>
          <select
            {...register('assignmentType', { required: 'Assignment type is required' })}
            disabled={!!preselectedStudents || !!preselectedClass}
            className="block w-full rounded-md border-gray-300 shadow-sm px-3 py-2"
          >
            <option value="SINGLE">Single Student</option>
            <option value="BULK_CLASS">Entire Class</option>
            <option value="BULK_CUSTOM">Selected Students</option>
          </select>
          {errors.assignmentType && (
            <p className="text-red-500 text-sm mt-1">{errors.assignmentType.message}</p>
          )}
        </div>

        {/* Class Selection for BULK_CLASS */}
        {assignmentType === 'BULK_CLASS' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Form</label>
              <select
                {...register('form', { required: 'Form is required' })}
                disabled={!!preselectedClass}
                className="block w-full rounded-md border-gray-300 shadow-sm px-3 py-2"
              >
                <option value="">Select Form</option>
                {uniqueClasses && Array.from(new Set(uniqueClasses.map(c => c.form))).map(form => (
                  <option key={form} value={form}>{form}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Section</label>
              <select
                {...register('section', { required: 'Section is required' })}
                disabled={!!preselectedClass}
                className="block w-full rounded-md border-gray-300 shadow-sm px-3 py-2"
              >
                <option value="">Select Section</option>
                {uniqueClasses && uniqueClasses
                  .filter(c => c.form === selectedForm)
                  .map(c => (
                    <option key={c.section} value={c.section}>{c.section}</option>
                  ))}
              </select>
            </div>
          </div>
        )}

        {/* Student Selection for SINGLE and BULK_CUSTOM */}
        {(assignmentType === 'SINGLE' || assignmentType === 'BULK_CUSTOM') && (
          <div>
            <label className="block text-sm font-medium mb-2">
              {assignmentType === 'SINGLE' ? 'Select Student' : 'Select Students'}
            </label>
            <select
              {...register('studentIds', { 
                required: 'At least one student is required',
                validate: value => assignmentType === 'SINGLE' ? 
                  value.length === 1 || 'Select exactly one student' : 
                  value.length > 0 || 'Select at least one student'
              })}
              multiple={assignmentType === 'BULK_CUSTOM'}
              disabled={!!preselectedStudents}
              className="block w-full rounded-md border-gray-300 shadow-sm px-3 py-2"
            >
              {students && students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} ({student.form} {student.section})
                </option>
              ))}
            </select>
            {errors.studentIds && (
              <p className="text-red-500 text-sm mt-1">{errors.studentIds.message}</p>
            )}
          </div>
        )}

        {/* Show selected class students for BULK_CLASS */}
        {assignmentType === 'BULK_CLASS' && classStudents.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Students in {selectedForm} {selectedSection} ({classStudents.length})</h3>
            <div className="max-h-32 overflow-y-auto">
              {classStudents.map(student => (
                <div key={student.id} className="text-sm py-1">
                  {student.firstName} {student.lastName} ({student.studentId})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subject Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Subjects</label>
          <select
            {...register('subjectIds', { required: 'At least one subject is required' })}
            multiple
            size={6}
            className="block w-full rounded-md border-gray-300 shadow-sm px-3 py-2"
          >
            {subjects && subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.code}) - {subject.level}
              </option>
            ))}
          </select>
          {errors.subjectIds && (
            <p className="text-red-500 text-sm mt-1">{errors.subjectIds.message}</p>
          )}
        </div>

        {/* Academic Year */}
        <div>
          <label className="block text-sm font-medium mb-2">Academic Year</label>
          <select 
            {...register('academicYear', { required: 'Academic year is required' })}
            className="block w-full rounded-md border-gray-300 shadow-sm px-3 py-2"
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Assigning...' : 'Assign Subjects'}
          </Button>
        </div>
      </form>
    </Card>
  );
};