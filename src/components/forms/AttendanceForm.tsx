import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Button, Input, Card } from '../ui';
import type { Student, Attendance } from '../../types';
import { Check, X, Users, Calendar } from 'lucide-react';

interface AttendanceFormProps {
  onSubmit: (attendanceData: { studentId: number; present: boolean; date: string }[]) => Promise<void>;
  students: Student[];
  existingAttendance?: Attendance[];
  selectedDate: string;
  isLoading?: boolean;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({
  onSubmit,
  students,
  existingAttendance = [],
  selectedDate,
  isLoading = false
}) => {
  const [attendanceRecords, setAttendanceRecords] = useState<Record<number, boolean>>(() => {
    const initialRecords: Record<number, boolean> = {};
    students.forEach(student => {
      const existingRecord = existingAttendance.find(
        att => att.student.id === student.id && att.date === selectedDate
      );
      initialRecords[student.id] = existingRecord?.present ?? true;
    });
    return initialRecords;
  });

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      date: selectedDate
    }
  });

  const handleAttendanceChange = (studentId: number, present: boolean) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: present
    }));
  };

  const handleMarkAll = (present: boolean) => {
    const newRecords: Record<number, boolean> = {};
    students.forEach(student => {
      newRecords[student.id] = present;
    });
    setAttendanceRecords(newRecords);
  };

  const handleFormSubmit = async (data: { date: string }) => {
    try {
      const attendanceData = students.map(student => ({
        studentId: student.id,
        present: attendanceRecords[student.id],
        date: data.date
      }));

      await onSubmit(attendanceData);
      toast.success('Attendance recorded successfully!');
    } catch (error) {
      toast.error('Failed to record attendance');
    }
  };

  const presentCount = Object.values(attendanceRecords).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Date Selection */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Attendance Date
          </h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center text-green-600">
              <Check className="h-4 w-4 mr-1" />
              Present: {presentCount}
            </div>
            <div className="flex items-center text-red-600">
              <X className="h-4 w-4 mr-1" />
              Absent: {absentCount}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleMarkAll(true)}
              className="flex items-center"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark All Present
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleMarkAll(false)}
              className="flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Mark All Absent
            </Button>
          </div>
        </div>
      </Card>

      {/* Student List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Students ({students.length})
        </h3>

        <div className="space-y-3">
          {students.map((student) => (
            <div
              key={student.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                attendanceRecords[student.id]
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {student.studentId} • {student.form} {student.section}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleAttendanceChange(student.id, true)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    attendanceRecords[student.id]
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                  }`}
                >
                  Present
                </button>
                <button
                  type="button"
                  onClick={() => handleAttendanceChange(student.id, false)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    !attendanceRecords[student.id]
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                  }`}
                >
                  Absent
                </button>
              </div>
            </div>
          ))}
        </div>

        {students.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No students found for this class.
          </div>
        )}
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          loading={isLoading}
          disabled={students.length === 0}
        >
          Record Attendance
        </Button>
      </div>
    </form>
  );
};

export default AttendanceForm;