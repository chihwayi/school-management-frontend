import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Button, Input, Card } from '../ui';
import type { Student, ClassGroup } from '../../types';
import { formatDate } from '../../utils';

interface AttendanceRecord {
  studentId: number;
  present: boolean;
}

interface BulkAttendanceFormProps {
  classGroup: ClassGroup;
  date: string;
  onSubmit: (data: { date: string; attendanceRecords: AttendanceRecord[] }) => Promise<void>;
  onCancel: () => void;
  existingAttendance?: { [studentId: number]: boolean };
  isLoading?: boolean;
}

const BulkAttendanceForm: React.FC<BulkAttendanceFormProps> = ({
  classGroup,
  date,
  onSubmit,
  onCancel,
  existingAttendance = {},
  isLoading = false
}) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<{ date: string }>({
    defaultValues: {
      date: date || formatDate(new Date().toISOString())
    }
  });

  const currentDate = watch('date');

  // Initialize attendance records
  useEffect(() => {
    if (classGroup.students) {
      const initialRecords = classGroup.students.map(student => ({
        studentId: student.id,
        present: existingAttendance[student.id] ?? true
      }));
      // Only update if the records have actually changed
      const currentIds = new Set(attendanceRecords.map(r => r.studentId));
      const hasChanges = initialRecords.length !== attendanceRecords.length || 
        initialRecords.some(r => !currentIds.has(r.studentId));
      
      if (hasChanges) {
        setAttendanceRecords(initialRecords);
      }
    }
  }, [classGroup.students, JSON.stringify(existingAttendance)]);

  // Update selectAll state based on attendance records
  // Using JSON.stringify to create a stable dependency that only changes when the actual data changes
  useEffect(() => {
    if (attendanceRecords.length > 0) {
      const allPresent = attendanceRecords.every(record => record.present);
      if (allPresent !== selectAll) {
        setSelectAll(allPresent);
      }
    }
  }, [JSON.stringify(attendanceRecords.map(r => r.present))]);

  const handleFormSubmit = async (data: { date: string }) => {
    try {
      await onSubmit({
        date: data.date,
        attendanceRecords
      });
      toast.success('Attendance marked successfully!');
    } catch (error) {
      toast.error('Failed to mark attendance');
    }
  };

  const handleStudentAttendance = (studentId: number, present: boolean) => {
    setAttendanceRecords(prev =>
      prev.map(record =>
        record.studentId === studentId
          ? { ...record, present }
          : record
      )
    );
  };

  const handleSelectAll = (present: boolean) => {
    setSelectAll(present);
    setAttendanceRecords(prev =>
      prev.map(record => ({ ...record, present }))
    );
  };

  const getPresentCount = () => {
    return attendanceRecords.filter(record => record.present).length;
  };

  const getAbsentCount = () => {
    return attendanceRecords.filter(record => !record.present).length;
  };

  const students = classGroup.students || [];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Mark Attendance</h4>
        <div className="text-sm text-blue-800">
          <p><strong>Class:</strong> {classGroup.form} {classGroup.section}</p>
          <p><strong>Academic Year:</strong> {classGroup.academicYear}</p>
          <p><strong>Total Students:</strong> {students.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="flex items-end">
          <div className="text-sm text-gray-700">
            <p><strong>Present:</strong> {getPresentCount()}</p>
            <p><strong>Absent:</strong> {getAbsentCount()}</p>
          </div>
        </div>
      </div>

      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-lg font-medium text-gray-900">Student Attendance</h5>
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(true)}
                disabled={isLoading}
              >
                Mark All Present
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(false)}
                disabled={isLoading}
              >
                Mark All Absent
              </Button>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {students.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No students found in this class</p>
            ) : (
              students.map(student => {
                const attendanceRecord = attendanceRecords.find(
                  record => record.studentId === student.id
                );
                const isPresent = attendanceRecord?.present ?? true;

                return (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      isPresent
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.studentId}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`${student.id}-present`}
                          name={`attendance-${student.id}`}
                          checked={isPresent}
                          onChange={() => handleStudentAttendance(student.id, true)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <label
                          htmlFor={`${student.id}-present`}
                          className="text-sm text-green-700 cursor-pointer"
                        >
                          Present
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`${student.id}-absent`}
                          name={`attendance-${student.id}`}
                          checked={!isPresent}
                          onChange={() => handleStudentAttendance(student.id, false)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        />
                        <label
                          htmlFor={`${student.id}-absent`}
                          className="text-sm text-red-700 cursor-pointer"
                        >
                          Absent
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Card>

      <div className="bg-amber-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-amber-900 mb-2">Important Notes</h4>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• WhatsApp notifications will be sent to guardians of absent students</li>
          <li>• Attendance can be updated later if needed</li>
          <li>• Make sure to mark attendance for all students before submitting</li>
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
          disabled={students.length === 0}
        >
          Mark Attendance
        </Button>
      </div>
    </form>
  );
};

export default BulkAttendanceForm;