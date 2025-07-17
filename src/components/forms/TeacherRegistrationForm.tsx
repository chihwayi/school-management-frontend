import React from 'react';
import { useForm } from 'react-hook-form';
import { GraduationCap, Mail, Lock, User, IdCard } from 'lucide-react';
import type { TeacherRegistrationDTO } from '../../types';
import { Button, Input, Card } from '../ui';
import { validateEmail, validatePassword } from '../../utils/validation';

interface TeacherRegistrationFormProps {
  onSubmit: (data: TeacherRegistrationDTO) => Promise<void>;
  initialData?: any;
  isLoading?: boolean;
  error?: string;
}

const TeacherRegistrationForm: React.FC<TeacherRegistrationFormProps> = ({
  onSubmit,
  initialData,
  isLoading,
  error
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<TeacherRegistrationDTO>({
    defaultValues: initialData ? {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      employeeId: initialData.employeeId,
      username: initialData.user?.username || '',
      email: initialData.user?.email || '',
      password: '' // Don't pre-fill password for security
    } : {}
  });

  const password = watch('password');

  const handleFormSubmit = async (data: TeacherRegistrationDTO) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
            
            <Input
              label="Username"
              {...register('username', { 
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters'
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Username can only contain letters, numbers, and underscores'
                }
              })}
              error={errors.username?.message}
              placeholder="Enter username"
              leftIcon={<User className="h-4 w-4 text-gray-400" />}
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Lock className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              {...register('email', { 
                required: 'Email is required',
                validate: (value) => validateEmail(value) || 'Please enter a valid email address'
              })}
              error={errors.email?.message}
              placeholder="Enter email address"
              leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
            />
            
            <Input
              label="Password"
              type="password"
              {...register('password', { 
                required: 'Password is required',
                validate: (value) => validatePassword(value) || 'Password must be at least 8 characters with uppercase, lowercase, and number'
              })}
              error={errors.password?.message}
              placeholder="Enter password"
              leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
            />
          </div>
          
          <div className="mt-4">
            <div className="text-sm text-gray-500">
              <p className="mb-2">Password requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>At least 8 characters long</li>
                <li>Contains uppercase letter</li>
                <li>Contains lowercase letter</li>
                <li>Contains at least one number</li>
              </ul>
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
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto"
        >
          {isLoading ? 
            (initialData ? 'Updating...' : 'Creating Account...') : 
            (initialData ? 'Update Teacher' : 'Create Teacher Account')
          }
        </Button>
      </div>
    </form>
  );
};

export default TeacherRegistrationForm;