import React from 'react';
import { useForm } from 'react-hook-form';
import { GraduationCap, User, IdCard } from 'lucide-react';
import type { Teacher } from '../../types';
import { Button, Input, Card } from '../ui';

interface TeacherEditFormProps {
  teacher: Teacher;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

const TeacherEditForm: React.FC<TeacherEditFormProps> = ({
  teacher,
  onSubmit,
  onCancel,
  isLoading,
  error
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      employeeId: teacher.employeeId
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <GraduationCap className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Teacher Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              {...register('firstName', { required: 'First name is required' })}
              error={errors.firstName?.message}
              placeholder="Enter first name"
              leftIcon={<User className="h-4 w-4 text-gray-400" />}
            />
            
            <Input
              label="Last Name"
              {...register('lastName', { required: 'Last name is required' })}
              error={errors.lastName?.message}
              placeholder="Enter last name"
              leftIcon={<User className="h-4 w-4 text-gray-400" />}
            />
            
            <Input
              label="Employee ID"
              {...register('employeeId', { 
                required: 'Employee ID is required',
                pattern: {
                  value: /^[A-Z0-9]{6,12}$/,
                  message: 'Employee ID must be 6-12 alphanumeric characters'
                }
              })}
              error={errors.employeeId?.message}
              placeholder="e.g., EMP001"
              leftIcon={<IdCard className="h-4 w-4 text-gray-400" />}
            />
            
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="p-2 bg-gray-100 rounded border border-gray-300 text-gray-700">
                {teacher.user?.username || 'N/A'}
              </div>
              <p className="mt-1 text-xs text-gray-500">Username cannot be changed</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              <p>To change account information (email/password), please use the User Management section.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Update Teacher'}
        </Button>
      </div>
    </form>
  );
};

export default TeacherEditForm;