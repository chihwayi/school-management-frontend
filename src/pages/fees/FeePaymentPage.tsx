import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Button, Input } from '../../components/ui';
import { studentService } from '../../services/studentService';
import { feePaymentService } from '../../services/feePaymentService';
import { useRoleCheck } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { DollarSign, Receipt } from 'lucide-react';
import type { FeePaymentDTO, PaymentReceiptDTO } from '../../types/feePayment';
import { getCurrentAcademicYear, getCurrentTerm } from '../../utils';
import type { Student } from '../../types';
import { feeSettingsService } from '../../services/feeSettingsService';

const FeePaymentPage: React.FC = () => {
  const { isClerk } = useRoleCheck();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [paymentData, setPaymentData] = useState({
    term: getCurrentTerm(),
    month: new Date().toLocaleString('default', { month: 'long' }),
    academicYear: getCurrentAcademicYear(),
    monthlyFeeAmount: '',
    amountPaid: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });
  const [receipt, setReceipt] = useState<PaymentReceiptDTO | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentReceiptDTO[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getAllStudents,
  });
  
  const { data: feeSettings, isLoading: isLoadingFees } = useQuery({
    queryKey: ['feeSettings'],
    queryFn: feeSettingsService.getAllFeeSettings,
  });
  
  // Scroll to receipt when it changes
  useEffect(() => {
    if (receipt) {
      setTimeout(() => {
        const receiptElement = document.querySelector('.receipt-card');
        receiptElement?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [receipt]);

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
      
      // Add to payment history
      setPaymentHistory(prev => [receiptData, ...prev]);
      
      toast.success('Payment recorded successfully');
      
      // Reset form but keep the selected student
      setPaymentData({
        ...paymentData,
        monthlyFeeAmount: '',
        amountPaid: ''
      });
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const printReceiptFromHistory = (receiptData: PaymentReceiptDTO) => {
    // Get school info from localStorage
    const schoolStorage = localStorage.getItem('school-storage');
    const schoolData = schoolStorage ? JSON.parse(schoolStorage) : {};
    const school = schoolData.state?.school || {};
    const theme = schoolData.state?.theme || {};
    
    // Fix logo URL by adding the API base URL if it's a relative path
    let logoUrl = theme.logoPath || '';
    if (logoUrl && !logoUrl.startsWith('http')) {
      logoUrl = `http://localhost:8080${logoUrl}`;
    }
    
    const primaryColor = theme.primaryColor || '#3b82f6';
    const secondaryColor = theme.secondaryColor || '#1e40af';
    
    const receiptId = `REC-${Date.now().toString().slice(-6)}`;
    const formattedDate = new Date(receiptData.paymentDate).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Fee Payment Receipt</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f9fafb;
              color: #1f2937;
            }
            
            .receipt-container {
              max-width: 800px;
              margin: 20px auto;
              background-color: white;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
              overflow: hidden;
            }
            
            .receipt-header {
              background-color: ${primaryColor};
              color: white;
              padding: 20px;
              text-align: center;
              position: relative;
            }
            
            .receipt-logo {
              max-height: 80px;
              max-width: 200px;
              margin-bottom: 10px;
            }
            
            .receipt-title {
              font-size: 24px;
              font-weight: 700;
              margin: 0;
            }
            
            .receipt-subtitle {
              font-size: 16px;
              opacity: 0.9;
              margin: 5px 0 0;
            }
            
            .receipt-body {
              padding: 30px;
            }
            
            .receipt-id {
              text-align: right;
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 20px;
            }
            
            .receipt-section {
              margin-bottom: 25px;
            }
            
            .receipt-section-title {
              font-size: 16px;
              font-weight: 600;
              color: ${secondaryColor};
              margin-bottom: 10px;
              padding-bottom: 5px;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .receipt-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            
            .receipt-label {
              font-weight: 500;
              color: #4b5563;
            }
            
            .receipt-value {
              font-weight: 600;
            }
            
            .receipt-total {
              background-color: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
              margin-top: 20px;
            }
            
            .receipt-total .receipt-row {
              margin-bottom: 5px;
            }
            
            .receipt-total .receipt-row:last-child {
              margin-top: 10px;
              padding-top: 10px;
              border-top: 2px dashed #e5e7eb;
              font-size: 18px;
            }
            
            .receipt-footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
            }
            
            .receipt-note {
              font-style: italic;
              margin-top: 5px;
            }
            
            .amount-paid {
              color: #047857;
            }
            
            .balance {
              color: ${receiptData.balance > 0 ? '#b91c1c' : '#047857'};
            }
            
            @media print {
              body {
                background-color: white;
              }
              
              .receipt-container {
                box-shadow: none;
                margin: 0;
              }
              
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="receipt-header">
              ${logoUrl ? `<img src="${logoUrl}" alt="School Logo" class="receipt-logo">` : ''}
              <h1 class="receipt-title">${school.name || 'School Management System'}</h1>
              <p class="receipt-subtitle">Fee Payment Receipt</p>
            </div>
            
            <div class="receipt-body">
              <div class="receipt-id">
                <div>Receipt #: ${receiptId}</div>
                <div>Date: ${formattedDate}</div>
              </div>
              
              <div class="receipt-section">
                <h2 class="receipt-section-title">Student Information</h2>
                <div class="receipt-row">
                  <span class="receipt-label">Student Name:</span>
                  <span class="receipt-value">${receiptData.studentName}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Class:</span>
                  <span class="receipt-value">${receiptData.className}</span>
                </div>
              </div>
              
              <div class="receipt-section">
                <h2 class="receipt-section-title">Payment Details</h2>
                <div class="receipt-row">
                  <span class="receipt-label">Term:</span>
                  <span class="receipt-value">${receiptData.term}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Month:</span>
                  <span class="receipt-value">${receiptData.month}</span>
                </div>
              </div>
              
              <div class="receipt-total">
                <div class="receipt-row">
                  <span class="receipt-label">Monthly Fee:</span>
                  <span class="receipt-value">$${receiptData.monthlyFeeAmount || '0.00'}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Amount Paid:</span>
                  <span class="receipt-value amount-paid">$${receiptData.amountPaid}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Balance:</span>
                  <span class="receipt-value balance">$${receiptData.balance}</span>
                </div>
                <div class="receipt-row">
                  <span class="receipt-label">Status:</span>
                  <span class="receipt-value ${receiptData.paymentStatus === 'FULL_PAYMENT' ? 'amount-paid' : receiptData.paymentStatus === 'PART_PAYMENT' ? 'balance' : ''}">
                    ${receiptData.paymentStatus === 'FULL_PAYMENT' ? 'Fully Paid' : 
                      receiptData.paymentStatus === 'PART_PAYMENT' ? 'Partially Paid' : 'Not Paid'}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="receipt-footer">
              <p>Thank you for your payment!</p>
              <p class="receipt-note">This is an official receipt from ${school.name || 'School Management System'}.</p>
            </div>
          </div>
          
          <div class="no-print" style="text-align: center; margin: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: ${primaryColor}; color: white; border: none; border-radius: 5px; cursor: pointer; font-family: 'Inter', sans-serif;">
              Print Receipt
            </button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  
  const printReceipt = () => {
    if (!receipt) return;
    printReceiptFromHistory(receipt);
  };

  if (!isClerk()) {
    return <div>Access denied. Only clerks can record payments.</div>;
  }
  
  // Check if fee settings are available
  if (isLoadingFees) {
    return <div className="p-6">Loading fee settings...</div>;
  }
  
  if (!feeSettings || feeSettings.length === 0) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <div className="text-center">
            <DollarSign className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Fee Settings Available</h2>
            <p className="text-gray-600 mb-4">
              Fee settings must be configured before payments can be recorded.
            </p>
            <Button 
              onClick={() => window.location.href = '/app/fees/settings'}
              useTheme
            >
              Go to Fee Settings
            </Button>
          </div>
        </Card>
      </div>
    );
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
              <div className="relative">
                <Input
                  placeholder="Search by name or student ID"
                  onChange={(e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    setSearchResults(
                      (students || []).filter(student => 
                        student.firstName.toLowerCase().includes(searchTerm) ||
                        student.lastName.toLowerCase().includes(searchTerm) ||
                        student.studentId.toLowerCase().includes(searchTerm)
                      )
                    );
                    setShowResults(searchTerm.length > 0);
                  }}
                />
                {showResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map(student => (
                      <div 
                        key={student.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedStudent(student.id);
                          setSelectedStudentName(`${student.firstName} ${student.lastName} - ${student.studentId}`);
                          
                          // Set fee amount based on student level from fee settings
                          const feeSetting = feeSettings?.find(fee => 
                            fee.level === student.level && 
                            fee.academicYear === getCurrentAcademicYear() && 
                            fee.active
                          );
                          
                          const feeAmount = feeSetting?.amount || 0;
                          
                          setPaymentData(prev => ({
                            ...prev,
                            monthlyFeeAmount: feeAmount.toString()
                          }));
                          
                          setShowResults(false);
                        }}
                      >
                        {student.firstName} {student.lastName} - {student.studentId}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedStudentName && (
                <div className="mt-2 text-sm font-medium text-blue-600">
                  Selected: {selectedStudentName}
                </div>
              )}
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
                readOnly
                className="bg-gray-50"
                placeholder="Select a student to set fee amount"
              />
              <p className="text-xs text-gray-500 mt-1">Fee amount is set automatically based on student level</p>
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
          <Card className="p-6 receipt-card">
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
                <span className="font-medium">Monthly Fee:</span>
                <span>${receipt.monthlyFeeAmount || 'N/A'}</span>
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
                <span className="font-medium">Status:</span>
                <span className={
                  receipt.paymentStatus === 'FULL_PAYMENT' ? 'text-green-600' : 
                  receipt.paymentStatus === 'PART_PAYMENT' ? 'text-amber-600' : 'text-red-600'
                }>
                  {receipt.paymentStatus === 'FULL_PAYMENT' ? 'Fully Paid' : 
                   receipt.paymentStatus === 'PART_PAYMENT' ? 'Partially Paid' : 'Not Paid'}
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
      
      {/* Payment History Section */}
      {paymentHistory.length > 0 && (
        <Card className="p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Recent Payment History</h2>
          <div className="space-y-4">
            {paymentHistory.map((historyReceipt, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{historyReceipt.studentName}</div>
                    <div className="text-sm text-gray-500">
                      {historyReceipt.term} - {historyReceipt.month} - ${historyReceipt.amountPaid}
                    </div>
                  </div>
                  <Button
                    onClick={() => printReceiptFromHistory(historyReceipt)}
                    useTheme
                    size="sm"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Print Receipt
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default FeePaymentPage;