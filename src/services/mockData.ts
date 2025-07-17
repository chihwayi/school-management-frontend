import type { ClassGroup, Student, Attendance, Report, Teacher } from '../types';

// Mock data for classes
export const mockClassGroups: ClassGroup[] = [
  {
    id: 1,
    form: 'Form 1',
    section: 'A',
    academicYear: '2023',
    classTeacher: {
      id: 1,
      firstName: 'Default',
      lastName: 'Teacher',
      employeeId: 'TEACH001'
    }
  },
  {
    id: 2,
    form: 'Form 2',
    section: 'B',
    academicYear: '2023'
  },
  {
    id: 3,
    form: 'Form 3',
    section: 'A',
    academicYear: '2023'
  },
  {
    id: 4,
    form: 'Form 4',
    section: 'C',
    academicYear: '2023'
  },
  {
    id: 5,
    form: 'Form 5',
    section: 'A',
    academicYear: '2023'
  },
  {
    id: 6,
    form: 'Form 6',
    section: 'B',
    academicYear: '2023'
  }
];

// Mock data for students
export const mockStudents: Student[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    studentId: 'STU001',
    form: 'Form 1',
    section: 'A',
    level: 'O_LEVEL',
    academicYear: '2023'
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    studentId: 'STU002',
    form: 'Form 1',
    section: 'A',
    level: 'O_LEVEL',
    academicYear: '2023'
  }
];

// Mock data for attendance
export const mockAttendance: Attendance[] = [
  {
    id: 1,
    student: mockStudents[0],
    date: '2025-07-17',
    present: true
  },
  {
    id: 2,
    student: mockStudents[1],
    date: '2025-07-17',
    present: false
  }
];

// Mock data for reports
export const mockReports: Report[] = [
  {
    id: 1,
    student: mockStudents[0],
    term: 'Term 1',
    year: '2025',
    overallComment: 'Excellent student, shows great potential.',
    finalized: true
  },
  {
    id: 2,
    student: mockStudents[1],
    term: 'Term 1',
    year: '2025',
    overallComment: '',
    finalized: false
  }
];