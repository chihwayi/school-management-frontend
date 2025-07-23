export interface Report {
  id: number;
  student: {
    firstName: string;
    lastName: string;
    form: string;
    section: string;
  };
  term: string;
  academicYear: string;
  finalized: boolean;
  paymentStatus: string;
  overallComment?: string;
  principalComment?: string;
  attendanceDays?: number;
  totalSchoolDays?: number;
  classTeacherSignatureUrl?: string;
  subjectReports?: SubjectReport[];
  classTeacher?: {
    firstName: string;
    lastName: string;
  };
}

export interface SubjectReport {
  id: number;
  subject: {
    name: string;
    category: string;
  };
  courseworkMark?: number;
  examMark?: number;
  totalMark?: number;
  grade?: string;
  teacherComment?: string;
  teacherSignatureUrl?: string;
  teacher?: {
    firstName: string;
    lastName: string;
  };
}

export interface ClassGroup {
  id: number;
  form: string;
  section: string;
  academicYear: string;
}

export interface SchoolSettings {
  id: number;
  schoolName: string;
  schoolAddress?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  schoolLogoUrl?: string;
  ministryLogoUrl?: string;
  principalName?: string;
  principalSignatureUrl?: string;
  reportHeaderText?: string;
  reportFooterText?: string;
}