import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { StudentSubjectAssignmentForm } from '../../components/forms/StudentSubjectAssignmentForm';

export const StudentSubjectAssignmentPage: React.FC = () => {
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  const handleAssignmentSuccess = () => {
    setShowAssignmentModal(false);
    // Optionally refresh data or show success message
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Subject Assignment</h1>
          <p className="text-gray-600">Assign subjects to students individually or in bulk</p>
        </div>
        <Button onClick={() => setShowAssignmentModal(true)}>
          Assign Subjects
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Single Assignment</h3>
          <p className="text-gray-600 mb-4">Assign subjects to individual students</p>
          <Button 
            variant="outline" 
            onClick={() => setShowAssignmentModal(true)}
            className="w-full"
          >
            Single Assignment
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Class Assignment</h3>
          <p className="text-gray-600 mb-4">Assign subjects to entire class</p>
          <Button 
            variant="outline" 
            onClick={() => setShowAssignmentModal(true)}
            className="w-full"
          >
            Class Assignment
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Custom Assignment</h3>
          <p className="text-gray-600 mb-4">Assign subjects to selected students</p>
          <Button 
            variant="outline" 
            onClick={() => setShowAssignmentModal(true)}
            className="w-full"
          >
            Custom Assignment
          </Button>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Assignment Guidelines</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">Single Assignment</h3>
            <p className="text-gray-600">Use this for new students or individual subject changes. Select one student and one or more subjects.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Class Assignment</h3>
            <p className="text-gray-600">Assign subjects to all students in a specific form and section. Ideal for core subjects that all students must take.</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Custom Assignment</h3>
            <p className="text-gray-600">Select specific students from different classes and assign subjects. Useful for elective subjects or special programs.</p>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        title="Assign Subjects"
        size="lg"
      >
        <StudentSubjectAssignmentForm
          onSuccess={handleAssignmentSuccess}
          onCancel={() => setShowAssignmentModal(false)}
        />
      </Modal>
    </div>
  );
};