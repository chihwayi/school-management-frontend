import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Button, Input, Select } from '../ui';
import type { GuardianDTO, Guardian } from '../../types';
import { validatePhone } from '../../utils/validation';

interface GuardianFormProps {
  onSubmit?: (data: GuardianDTO) => Promise<void>;
  onSuccess?: () => void;
  onCancel: () => void;
  initialData?: Guardian;
  guardian?: Guardian;
  isLoading?: boolean;
}

const GuardianForm: React.FC<GuardianFormProps> = ({
  onSubmit,
  onSuccess,
  onCancel,
  initialData,
  guardian,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<GuardianDTO>({
    defaultValues: (initialData || guardian)
      ? {
          id: (initialData || guardian)!.id,
          name: (initialData || guardian)!.name,
          relationship: (initialData || guardian)!.relationship,
          phoneNumber: (initialData || guardian)!.phoneNumber,
          whatsappNumber: (initialData || guardian)!.whatsappNumber,
          primaryGuardian: (initialData || guardian)!.primaryGuardian
        }
      : {
          name: '',
          relationship: '',
          phoneNumber: '',
          whatsappNumber: '',
          primaryGuardian: false
        }
  });

  const handleFormSubmit = async (data: GuardianDTO) => {
    try {
      if (onSubmit) {
        await onSubmit(data);
        toast.success(
          (initialData || guardian)
            ? 'Guardian updated successfully!'
            : 'Guardian added successfully!'
        );
        reset();
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error('Failed to save guardian');
    }
  };

  const relationshipOptions = [
    { value: 'Father', label: 'Father' },
    { value: 'Mother', label: 'Mother' },
    { value: 'Stepfather', label: 'Stepfather' },
    { value: 'Stepmother', label: 'Stepmother' },
    { value: 'Grandfather', label: 'Grandfather' },
    { value: 'Grandmother', label: 'Grandmother' },
    { value: 'Uncle', label: 'Uncle' },
    { value: 'Aunt', label: 'Aunt' },
    { value: 'Brother', label: 'Brother' },
    { value: 'Sister', label: 'Sister' },
    { value: 'Legal Guardian', label: 'Legal Guardian' },
    { value: 'Foster Parent', label: 'Foster Parent' },
    { value: 'Caregiver', label: 'Caregiver' },
    { value: 'Other Relative', label: 'Other Relative' },
    { value: 'Other', label: 'Other' }
  ];

  const phoneNumber = watch('phoneNumber');

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Full Name"
            placeholder="Enter guardian's full name"
            error={errors.name?.message}
            {...register('name', {
              required: 'Guardian name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters'
              }
            })}
          />
        </div>

        <div>
          <Select
            label="Relationship"
            options={relationshipOptions}
            error={errors.relationship?.message}
            {...register('relationship', {
              required: 'Relationship is required'
            })}
          />
        </div>

        <div>
          <Input
            label="Phone Number"
            placeholder="Enter phone number"
            error={errors.phoneNumber?.message}
            {...register('phoneNumber', {
              required: 'Phone number is required',
              validate: (value) => validatePhone(value) || 'Please enter a valid phone number'
            })}
          />
        </div>

        <div>
          <Input
            label="WhatsApp Number"
            placeholder="Enter WhatsApp number (optional)"
            error={errors.whatsappNumber?.message}
            {...register('whatsappNumber', {
              validate: (value) => {
                if (value && !validatePhone(value)) {
                  return 'Please enter a valid WhatsApp number';
                }
                return true;
              }
            })}
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave empty to use the same as phone number
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...register('primaryGuardian')}
            />
            <span className="ml-2 text-sm text-gray-700">
              Primary Guardian
            </span>
          </label>
          <p className="text-sm text-gray-500 mt-1">
            Primary guardian will receive all notifications and communications
          </p>
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
          loading={isLoading}
        >
          {(initialData || guardian) ? 'Update Guardian' : 'Add Guardian'}
        </Button>
      </div>
    </form>
  );
};

export default GuardianForm;