import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { User, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import type { StudentRegistrationDTO, GuardianDTO, Subject, Section } from '../../types';
import { Button, Input, Card, Select } from '../ui';
import { FORMS, LEVELS } from '../../types';
import { sectionService } from '../../services/sectionService';
import { getCurrentAcademicYear } from '../../utils';

interface StudentCreateFormProps {
  onSubmit: (data: StudentRegistrationDTO, guardians: GuardianDTO[]) => Promise<void>;
  subjects: Subject[];
  isLoading?: boolean;
  error?: string;
}

const StudentCreateForm: React.FC<StudentCreateFormProps> = ({
  onSubmit,
  subjects,
  isLoading,
  error
}) => {
  const [step, setStep] = useState(1);
  const [studentData, setStudentData] = useState<StudentRegistrationDTO | null>(null);
  const [guardians, setGuardians] = useState<GuardianDTO[]>([{
    name: '',
    relationship: '',
    phoneNumber: '',
    whatsappNumber: '',
    primaryGuardian: true
  }]);

  const { data: sections } = useQuery({
    queryKey: ['sections-active'],
    queryFn: sectionService.getActiveSections,
  });

  const {
    register: registerStudent,
    handleSubmit: handleStudentSubmit,
    formState: { errors: studentErrors },
    watch
  } = useForm<StudentRegistrationDTO>({
    defaultValues: {
      academicYear: getCurrentAcademicYear()
    }
  });

  const selectedLevel = watch('level');
  const availableForms = selectedLevel === LEVELS.JUNIOR_SECONDARY ? FORMS.JUNIOR_SECONDARY :
                        selectedLevel === LEVELS.O_LEVEL ? FORMS.O_LEVEL : 
                        selectedLevel === LEVELS.A_LEVEL ? FORMS.A_LEVEL : [];

  const handleStudentNext = (data: StudentRegistrationDTO) => {
    setStudentData(data);
    setStep(2);
  };

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

  const handleFinalSubmit = async () => {
    if (!studentData) return;
    
    const validGuardians = guardians.filter(g => g.name.trim() && g.relationship.trim());
    if (validGuardians.length === 0) {
      alert('At least one guardian is required');
      return;
    }

    await onSubmit(studentData, validGuardians);
  };

  if (step === 1) {
    return (
      <form onSubmit={handleStudentSubmit(handleStudentNext)} className="space-y-4">
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium">Student Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                {...registerStudent('firstName', { required: 'First name is required' })}
                error={studentErrors.firstName?.message}
              />
              
              <Input
                label="Last Name"
                {...registerStudent('lastName', { required: 'Last name is required' })}
                error={studentErrors.lastName?.message}
              />
              
              <Input
                label="Student ID"
                {...registerStudent('studentId', { required: 'Student ID is required' })}
                error={studentErrors.studentId?.message}
              />
              
              <Select
                label="Level"
                {...registerStudent('level', { required: 'Level is required' })}
                error={studentErrors.level?.message}
                options={[
                  { value: '', label: 'Select level' },
                  { value: LEVELS.JUNIOR_SECONDARY, label: 'Junior Secondary' },
                  { value: LEVELS.O_LEVEL, label: 'O Level' },
                  { value: LEVELS.A_LEVEL, label: 'A Level' }
                ]}
              />
              
              <Select
                label="Form"
                {...registerStudent('form', { required: 'Form is required' })}
                error={studentErrors.form?.message}
                options={[
                  { value: '', label: 'Select form' },
                  ...availableForms.map(form => ({ value: form, label: form }))
                ]}
                disabled={!selectedLevel}
              />
              
              <Select
                label="Section"
                {...registerStudent('section', { required: 'Section is required' })}
                error={studentErrors.section?.message}
                options={[
                  { value: '', label: 'Select section' },
                  ...(sections || []).map(section => ({ value: section.name, label: section.name }))
                ]}
              />
              
              <Input
                label="Academic Year"
                {...registerStudent('academicYear', { required: 'Academic year is required' })}
                error={studentErrors.academicYear?.message}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">
            Next: Guardian Info <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium">Guardian Information</h3>
          </div>
          
          <div className="space-y-4">
            {guardians.map((guardian, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Guardian {index + 1}</h4>
                  <div className="flex gap-2">
                    {guardians.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeGuardian(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={guardian.name}
                    onChange={(e) => updateGuardian(index, 'name', e.target.value)}
                    required
                  />
                  
                  <Select
                    label="Relationship"
                    value={guardian.relationship}
                    onChange={(e) => updateGuardian(index, 'relationship', e.target.value)}
                    options={[
                      { value: '', label: 'Select relationship' },
                      { value: 'Father', label: 'Father' },
                      { value: 'Mother', label: 'Mother' },
                      { value: 'Guardian', label: 'Guardian' }
                    ]}
                    required
                  />
                  
                  <Input
                    label="Phone Number"
                    value={guardian.phoneNumber}
                    onChange={(e) => updateGuardian(index, 'phoneNumber', e.target.value)}
                    required
                  />
                  
                  <Input
                    label="WhatsApp Number"
                    value={guardian.whatsappNumber || ''}
                    onChange={(e) => updateGuardian(index, 'whatsappNumber', e.target.value)}
                  />
                </div>
              </div>
            ))}
            
            <Button type="button" variant="outline" onClick={addGuardian}>
              Add Another Guardian
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={handleFinalSubmit} disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Student'}
        </Button>
      </div>
    </div>
  );
};

export default StudentCreateForm;