import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Button, Input, Select } from '../../components/ui';
import { studentService } from '../../services/studentService';
import { feePaymentService } from '../../services/feePaymentService';
import { useRoleCheck } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { DollarSign, Receipt } from 'lucide-react';
import type { FeePaymentDTO, PaymentReceiptDTO } from '../../types/feePayment';
import { getCurrentAcademicYear, getCurrentTerm } from '../../utils';

const FeePaymentPage: React.FC = () => {
  const { isClerk } = useRoleCheck();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [paymentData, setPaymentData] = useState({
    term: getCurrentTerm(),
    month: new Date().toLocaleString('default', { month: 'long' }),
    academicYear: getCurrentAcademicYear(),
    monthlyFeeAmount: '',
    amountPaid: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });
  const [receipt, setReceipt] = useState<PaymentReceiptDTO | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getAllStudents,
  });

  const handlePayment = async () => {
    if (!selectedStudent || !paymentData.monthlyFeeAmount || !paymentData.amountPaid) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsProcessing(true);
    try {
      const payment: FeePaymentDTO = {
        studentId: selectedStudent,
        term: paymentData.term,
        month: paymentData.month,
        academicYear: paymentData.academicYear,
        monthlyFeeAmount: parseFloat(paymentData.monthlyFeeAmount),
        amountPaid: parseFloat(paymentData.amountPaid),
        paymentDate: paymentData.paymentDate
      };

      const receiptData = await feePaymentService.recordPayment(payment);
      setReceipt(receiptData);
      toast.success('Payment recorded successfully');
      
      // Reset form
      setSelectedStudent(null);
      setPaymentData({
        ...paymentData,
        monthlyFeeAmount: '',
        amountPaid: ''
      });
    } catch (error) {
      toast.error('Failed to record payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const printReceipt = () => {
    if (!receipt) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Fee Payment Receipt</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Fee Payment Receipt</h2>
            <p><strong>Student:</strong> ${receipt.studentName}</p>
            <p><strong>Class:</strong> ${receipt.className}</p>
            <p><strong>Term:</strong> ${receipt.term}</p>
            <p><strong>Month:</strong> ${receipt.month}</p>
            <p><strong>Amount Paid:</strong> $${receipt.amountPaid}</p>
            <p><strong>Balance:</strong> $${receipt.balance}</p>
            <p><strong>Date:</strong> ${receipt.paymentDate}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!isClerk()) {
    return <div>Access denied. Only clerks can record payments.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fee Payment</h1>
        <DollarSign className="h-8 w-8 text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Record Payment</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Student</label>
              <Select
                value={selectedStudent?.toString() || ''}
                onChange={(e) => setSelectedStudent(Number(e.target.value))}
                placeholder="Select student"
              >
                <option value="">Select student</option>
                {students?.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} - {student.studentId}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Term</label>
                <Input
                  value={paymentData.term}
                  onChange={(e) => setPaymentData({...paymentData, term: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Month</label>
                <Input
                  value={paymentData.month}
                  onChange={(e) => setPaymentData({...paymentData, month: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Monthly Fee Amount</label>
              <Input
                type="number"
                step="0.01"
                value={paymentData.monthlyFeeAmount}
                onChange={(e) => setPaymentData({...paymentData, monthlyFeeAmount: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amount Paid</label>
              <Input
                type="number"
                step="0.01"
                value={paymentData.amountPaid}
                onChange={(e) => setPaymentData({...paymentData, amountPaid: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Payment Date</label>
              <Input
                type="date"
                value={paymentData.paymentDate}
                onChange={(e) => setPaymentData({...paymentData, paymentDate: e.target.value})}
              />
            </div>

            <Button 
              onClick={handlePayment} 
              disabled={isProcessing}
              className="w-full"
              useTheme
            >
              {isProcessing ? 'Processing...' : 'Record Payment'}
            </Button>
          </div>
        </Card>

        {/* Receipt Display */}
        {receipt && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Payment Receipt</h2>
              <Receipt className="h-6 w-6 text-blue-600" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Student:</span>
                <span>{receipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Class:</span>
                <span>{receipt.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Term:</span>
                <span>{receipt.term}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Month:</span>
                <span>{receipt.month}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Amount Paid:</span>
                <span className="text-green-600 font-semibold">${receipt.amountPaid}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Balance:</span>
                <span className={receipt.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                  ${receipt.balance}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{receipt.paymentDate}</span>
              </div>
            </div>

            <Button 
              onClick={printReceipt} 
              variant="outline" 
              className="w-full mt-4"
            >
              Print Receipt
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FeePaymentPage;