import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Button, Input, Select, Card } from '../ui';
import type { RegisterRequest } from '../../types';
import { ERole } from '../../types';
import { validateEmail, validatePassword } from '../../utils/validation';
import { formatRoleName } from '../../utils';

interface UserRegistrationFormProps {
  onSubmit: (data: RegisterRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  availableRoles?: ERole[];
}

const UserRegistrationForm: React.FC<UserRegistrationFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  availableRoles = [ERole.ROLE_CLERK, ERole.ROLE_ADMIN]
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<RegisterRequest & { confirmPassword: string }>({
    defaultValues: {
      roles: [ERole.ROLE_CLERK]
    }
  });

  const password = watch('password');

  const handleFormSubmit = async (data: RegisterRequest & { confirmPassword: string }) => {
    try {
      if (data.password !== data.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      const { confirmPassword, ...submitData } = data;
      await onSubmit(submitData);
      toast.success('User registered successfully!');
    } catch (error) {
      toast.error('Failed to register user');
    }
  };

  const roleOptions = availableRoles.map(role => ({
    value: role,
    label: formatRoleName(role)
  }));

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900">Register New User</h3>
          <p className="mt-1 text-sm text-gray-600">
            Create a new user account with appropriate roles and permissions.
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Username"
                placeholder="Enter username"
                error={errors.username?.message}
                {...register('username', {
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters'
                  },
                  maxLength: {
                    value: 20,
                    message: 'Username must not exceed 20 characters'
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Username can only contain letters, numbers, and underscores'
                  }
                })}
              />
            </div>

            <div>
              <Input
                label="Email"
                type="email"
                placeholder="Enter email address"
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  validate: {
                    validEmail: (value) => validateEmail(value) || 'Please enter a valid email address'
                  }
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  validate: {
                    strongPassword: (value) => validatePassword(value) || 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
                  }
                })}
              />
            </div>

            <div>
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: {
                    matchPassword: (value) => value === password || 'Passwords do not match'
                  }
                })}
              />
            </div>
          </div>

          <div>
            <Select
              label="Role"
              placeholder="Select user role"
              options={roleOptions}
              error={errors.roles?.message}
              {...register('roles.0', {
                required: 'Role is required'
              })}
            />
            <p className="mt-1 text-sm text-gray-500">
              Select the appropriate role for this user. This determines their permissions in the system.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Role Permissions</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Admin:</strong> Full system access, can manage all users and settings</p>
              <p><strong>Clerk:</strong> Can manage teachers, students, classes, and subjects</p>
            </div>
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
              Register User
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default UserRegistrationForm;