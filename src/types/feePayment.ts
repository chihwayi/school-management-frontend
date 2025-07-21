// Fee Payment Types
export enum PaymentStatus {
  FULL_PAYMENT = 'FULL_PAYMENT',
  PART_PAYMENT = 'PART_PAYMENT',
  NON_PAYER = 'NON_PAYER'
}

export interface FeePayment {
  id: number;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    studentId: string;
    form: string;
    section: string;
  };
  term: string;
  month: string;
  academicYear: string;
  monthlyFeeAmount: number;
  amountPaid: number;
  balance: number;
  paymentStatus: PaymentStatus;
  paymentDate: string;
  createdAt: string;
}

export interface FeePaymentDTO {
  studentId: number;
  term: string;
  month: string;
  academicYear: string;
  monthlyFeeAmount: number;
  amountPaid: number;
  paymentDate: string;
}

export interface StudentPaymentInfoDTO {
  studentId: number;
  studentName: string;
  className: string;
  amountPaid: number;
  balance: number;
  paymentStatus: PaymentStatus;
}

export interface PaymentStatusSummaryDTO {
  className: string;
  status: PaymentStatus;
  students: StudentPaymentInfoDTO[];
}

export interface PaymentReceiptDTO {
  studentName: string;
  className: string;
  term: string;
  month: string;
  amountPaid: number;
  balance: number;
  paymentDate: string;
  monthlyFeeAmount: number;
  paymentStatus: PaymentStatus;
}

export interface DailyPaymentSummaryDTO {
  date: string;
  totalAmount: number;
  totalTransactions: number;
}

export interface ClassFinancialSummaryDTO {
  className: string;
  totalStudents: number;
  fullPayments: number;
  partPayments: number;
  nonPayers: number;
  totalCollected: number;
  totalOutstanding: number;
}

export interface FinancialReportDTO {
  reportDate: string;
  term: string;
  academicYear: string;
  totalCollectedAmount: number;
  totalOutstandingAmount: number;
  totalExpectedRevenue: number;
  classSummaries: ClassFinancialSummaryDTO[];
  dailySummaries: DailyPaymentSummaryDTO[];
}

export interface StudentPaymentHistoryDTO {
  studentId: number;
  studentName: string;
  className: string;
  payments: {
    term: string;
    month: string;
    academicYear: string;
    amountPaid: number;
    balance: number;
    paymentDate: string;
    paymentStatus: PaymentStatus;
  }[];
  totalPaid: number;
  totalBalance: number;
}

export interface PaymentTrendDTO {
  date: string;
  totalAmount: number;
  transactionCount: number;
}

export interface ClassComparisonDTO {
  className: string;
  totalStudents: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  averagePaymentPerStudent: number;
}

export interface AuditLogDTO {
  id: number;
  action: string;
  description: string;
  performedBy: string;
  timestamp: string;
  paymentId?: number;
  studentId?: number;
  amount?: number;
}