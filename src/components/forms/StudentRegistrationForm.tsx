import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Users, BookOpen, Plus, Trash2, Heart } from 'lucide-react';
import type { StudentRegistrationDTO, GuardianDTO, Subject } from '../../types';
import { Button, Input, Card, Select } from '../ui';
import { FORMS, LEVELS } from '../../types';

interface StudentRegistrationFormProps {
  onSubmit: (data: StudentRegistrationDTO, guardians: GuardianDTO[]) => Promise<void>;
  subjects: Subject[];
  sections: string[];
  isLoading?: boolean;
  error?: string;
}

const StudentRegistrationForm: React.FC<StudentRegistrationFormProps> = ({
  onSubmit,
  subjects,
  sections,
  isLoading,
  error
}) => {
  const [guardians, setGuardians] = useState<GuardianDTO[]>([
    {
      name: '',
      relationship: '',
      phoneNumber: '',
      whatsappNumber: '',
      primaryGuardian: true
    }
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<StudentRegistrationDTO & { subjectIds: number[] }>();

  const selectedLevel = watch('level');
  const selectedForm = watch('form');

  const availableForms = selectedLevel === LEVELS.O_LEVEL ? FORMS.O_LEVEL : FORMS.A_LEVEL;
  const availableSubjects = subjects.filter(subject => subject.level === selectedLevel);

  const addGuardian = () => {
    setGuardians([...guardians, {
      name: '',
      relationship: '',
      phoneNumber: '',
      whatsappNumber: '',
      primaryGuardian: false
    }]);
  };

  const removeGuardian = (index: number) => {
    if (guardians.length > 1) {
      setGuardians(guardians.filter((_, i) => i !== index));
    }
  };

  const updateGuardian = (index: number, field: keyof GuardianDTO, value: any) => {
    const updated = guardians.map((guardian, i) => 
      i === index ? { ...guardian, [field]: value } : guardian
    );
    setGuardians(updated);
  };

  const setPrimaryGuardian = (index: number) => {
    const updated = guardians.map((guardian, i) => ({
      ...guardian,
      primaryGuardian: i === index
    }));
    setGuardians(updated);
  };

  const handleFormSubmit = async (data: StudentRegistrationDTO & { subjectIds: number[] }) => {
    const { subjectIds, ...studentData } = data;
    const validGuardians = guardians.filter(g => g.name.trim() && g.relationship.trim());
    
    if (validGuardians.length === 0) {
      throw new Error('At least one guardian is required');
    }

    try {
      await onSubmit({ ...studentData, subjectIds }, validGuardians);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Student Information */}
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Student Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              {...register('firstName', { required: 'First name is required' })}
              error={errors.firstName?.message}
              placeholder="Enter first name"
            />
            
            <Input
              label="Last Name"
              {...register('lastName', { required: 'Last name is required' })}
              error={errors.lastName?.message}
              placeholder="Enter last name"
            />
            
            <Input
              label="Student ID"
              {...register('studentId', { 
                required: 'Student ID is required',
                pattern: {
                  value: /^[A-Z0-9]{6,12}$/,
                  message: 'Student ID must be 6-12 alphanumeric characters'
                }
              })}
              error={errors.studentId?.message}
              placeholder="e.g., STU001"
            />
            
            <Select
              label="Level"
              {...register('level', { required: 'Level is required' })}
              error={errors.level?.message}
              options={[
                { value: LEVELS.O_LEVEL, label: 'O Level' },
                { value: LEVELS.A_LEVEL, label: 'A Level' }
              ]}
              placeholder="Select level"
            />
            
            <Select
              label="Form"
              {...register('form', { required: 'Form is required' })}
              error={errors.form?.message}
              options={availableForms.map(form => ({ value: form, label: form }))}
              placeholder="Select form"
              disabled={!selectedLevel}
            />
            
            <Select
              label="Section"
              {...register('section', { required: 'Section is required' })}
              error={errors.section?.message}
              options={sections.map(section => ({ value: section, label: section }))}
              placeholder="Select section"
            />
          </div>
        </div>
      </Card>

      {/* Subject Assignment */}
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <BookOpen className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Subject Assignment</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableSubjects.map((subject) => (
              <div key={subject.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`subject-${subject.id}`}
                  {...register('subjectIds')}
                  value={subject.id}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`subject-${subject.id}`}
                  className="ml-2 block text-sm text-gray-900"
                >
                  {subject.name} ({subject.code})
                </label>
              </div>
            ))}
          </div>
          
          {availableSubjects.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              Please select a level to view available subjects
            </p>
          )}
        </div>
      </Card>

      {/* Guardian Information */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Guardian Information</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addGuardian}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Guardian
            </Button>
          </div>
          
          <div className="space-y-6">
            {guardians.map((guardian, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium text-gray-900">
                      Guardian {index + 1}
                    </h4>
                    {guardian.primaryGuardian && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        <Heart className="h-3 w-3 mr-1" />
                        Primary
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!guardian.primaryGuardian && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimaryGuardian(index)}
                        className="text-xs"
                      >
                        Set as Primary
                      </Button>
                    )}
                    
                    {guardians.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeGuardian(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={guardian.name}
                    onChange={(e) => updateGuardian(index, 'name', e.target.value)}
                    placeholder="Enter guardian's full name"
                    required
                  />
                  
                  <Select
                    label="Relationship"
                    value={guardian.relationship}
                    onChange={(e) => updateGuardian(index, 'relationship', e.target.value)}
                    options={[
                      { value: 'Father', label: 'Father' },
                      { value: 'Mother', label: 'Mother' },
                      { value: 'Grandfather', label: 'Grandfather' },
                      { value: 'Grandmother', label: 'Grandmother' },
                      { value: 'Uncle', label: 'Uncle' },
                      { value: 'Aunt', label: 'Aunt' },
                      { value: 'Guardian', label: 'Guardian' },
                      { value: 'Other', label: 'Other' }
                    ]}
                    placeholder="Select relationship"
                    required
                  />
                  
                  <Input
                    label="Phone Number"
                    value={guardian.phoneNumber}
                    onChange={(e) => updateGuardian(index, 'phoneNumber', e.target.value)}
                    placeholder="e.g., +263 77 123 4567"
                    required
                  />
                  
                  <Input
                    label="WhatsApp Number"
                    value={guardian.whatsappNumber || ''}
                    onChange={(e) => updateGuardian(index, 'whatsappNumber', e.target.value)}
                    placeholder="e.g., +263 77 123 4567"
                  />
                </div>
              </div>
            ))}
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
          {isLoading ? 'Registering...' : 'Register Student'}
        </Button>
      </div>
    </form>
  );
};

export default StudentRegistrationForm;