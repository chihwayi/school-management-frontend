import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Button, Select, Badge } from '../../components/ui';
import { classService } from '../../services/classService';
import { feePaymentService } from '../../services/feePaymentService';
import { useRoleCheck } from '../../hooks/useAuth';
import { Users, DollarSign, AlertCircle } from 'lucide-react';
import type { PaymentStatusSummaryDTO } from '../../types/feePayment';
import { PaymentStatus } from '../../types/feePayment';

const PaymentStatusPage: React.FC = () => {
  const { canManageStudents } = useRoleCheck();
  const [selectedClass, setSelectedClass] = useState<{form: string, section: string} | null>(null);

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: classService.getAllClassGroups,
  });

  const { data: paymentStatus, isLoading } = useQuery({
    queryKey: ['payment-status', selectedClass?.form, selectedClass?.section],
    queryFn: () => selectedClass ? 
      feePaymentService.getPaymentStatusByClass(selectedClass.form, selectedClass.section) : 
      Promise.resolve([]),
    enabled: !!selectedClass
  });

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.FULL_PAYMENT:
        return 'success';
      case PaymentStatus.PART_PAYMENT:
        return 'warning';
      case PaymentStatus.NON_PAYER:
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.FULL_PAYMENT:
        return <DollarSign className="h-4 w-4" />;
      case PaymentStatus.PART_PAYMENT:
        return <AlertCircle className="h-4 w-4" />;
      case PaymentStatus.NON_PAYER:
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (!canManageStudents()) {
    return <div>Access denied.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payment Status by Class</h1>
        <Users className="h-8 w-8 text-blue-600" />
      </div>

      {/* Class Selection */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Select Class</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            value={selectedClass ? `${selectedClass.form}-${selectedClass.section}` : ''}
            onChange={(e) => {
              if (e.target.value) {
                const [form, section] = e.target.value.split('-');
                setSelectedClass({ form, section });
              } else {
                setSelectedClass(null);
              }
            }}
            placeholder="Select class"
            options={[
              { value: '', label: 'Select class' },
              ...(classes || []).map(cls => ({
                value: `${cls.form}-${cls.section}`,
                label: `${cls.form} ${cls.section}`
              }))
            ]}
          />
        </div>
      </Card>

      {/* Payment Status Display */}
      {selectedClass && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {paymentStatus?.map((statusGroup) => (
            <Card key={statusGroup.status} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(statusGroup.status)}
                  <h3 className="text-lg font-semibold">
                    {statusGroup.status.replace('_', ' ')}
                  </h3>
                </div>
                <Badge variant={getStatusColor(statusGroup.status)}>
                  {statusGroup.students.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {statusGroup.students.length > 0 ? (
                  statusGroup.students.map((student) => (
                    <div key={student.studentId} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{student.studentName}</h4>
                        <Badge variant={getStatusColor(student.paymentStatus)} size="sm">
                          {student.paymentStatus.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Paid:</span>
                          <span className="text-green-600">${student.amountPaid}</span>
                        </div>
                        {student.balance > 0 && (
                          <div className="flex justify-between">
                            <span>Balance:</span>
                            <span className="text-red-600">${student.balance}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No students in this category</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {!selectedClass && (
        <Card className="p-12">
          <div className="text-center text-gray-500">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">Select a class to view payment status</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PaymentStatusPage;