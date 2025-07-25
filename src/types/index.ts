export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  roles?: string[];
}

export interface JwtResponse {
  token: string;
  roles: string[];
  username: string;
  school?: SchoolInfo;
}

export interface SchoolInfo {
  name: string;
  logoPath?: string;
  backgroundPath?: string;
}

// School Types
export interface School {
  id: number;
  name: string;
  description?: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  website?: string;
  logoPath?: string;
  backgroundPath?: string;
  configured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolConfigDTO {
  name: string;
  description?: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  website?: string;
}

export interface SchoolSetupRequest {
  schoolConfig: SchoolConfigDTO;
  logo?: File;
  background?: File;
}

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  name: ERole;
}

export enum ERole {
  ROLE_USER = 'ROLE_USER',
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_CLERK = 'ROLE_CLERK',
  ROLE_TEACHER = 'ROLE_TEACHER',
  ROLE_CLASS_TEACHER = 'ROLE_CLASS_TEACHER'
}

// Student Types
export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  studentId: string;
  form: string;
  section: string;
  level: string;
  enrollmentDate: string;
  guardians?: Guardian[];
  subjects?: Subject[];
  classGroup?: ClassGroup;
  academicYear: string;
}

export interface StudentRegistrationDTO {
  firstName: string;
  lastName: string;
  studentId: string;
  form: string;
  section: string;
  level: string;
  academicYear: string;
  subjectIds?: number[];
}

export interface StudentUpdateDTO {
  firstName: string;
  lastName: string;
  form: string;
  section: string;
  level: string;
}

export interface StudentWithGuardiansDTO {
  id: number;
  firstName: string;
  lastName: string;
  studentId: string;
  form: string;
  section: string;
  level: string;
  guardians: GuardianDTO[];
}

// Teacher Types
export interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  employeeId: string;
  user: User;
  assignedSubjects?: TeacherSubjectClass[];
  supervisedClasses?: ClassGroup[];
}

export interface TeacherRegistrationDTO {
  firstName: string;
  lastName: string;
  employeeId: string;
  username: string;
  email: string;
  password: string;
}

export interface TeacherSubjectClass {
  id: number;
  teacher: Teacher;
  subject: Subject;
  form: string;
  section: string;
  academicYear: string;
}

export interface TeacherAssignmentDTO {
  teacherId: number;
  subjectId: number;
  form: string;
  section: string;
  academicYear: string;
}

// Subject Types
export interface Subject {
  id: number;
  name: string;
  code: string;
  category: SubjectCategory;
  level: string;
  description?: string;
}

export enum SubjectCategory {
  JUNIOR_SECONDARY_LANGUAGES = 'JUNIOR_SECONDARY_LANGUAGES',
  JUNIOR_SECONDARY_ARTS = 'JUNIOR_SECONDARY_ARTS',
  JUNIOR_SECONDARY_SCIENCES = 'JUNIOR_SECONDARY_SCIENCES',
  O_LEVEL_LANGUAGES = 'O_LEVEL_LANGUAGES',
  O_LEVEL_ARTS = 'O_LEVEL_ARTS',
  O_LEVEL_COMMERCIALS = 'O_LEVEL_COMMERCIALS',
  O_LEVEL_SCIENCES = 'O_LEVEL_SCIENCES',
  A_LEVEL_ARTS = 'A_LEVEL_ARTS',
  A_LEVEL_COMMERCIALS = 'A_LEVEL_COMMERCIALS',
  A_LEVEL_SCIENCES = 'A_LEVEL_SCIENCES'
}

// Class Group Types
export interface ClassGroup {
  id: number;
  form: string;
  section: string;
  academicYear: string;
  classTeacher?: Teacher;
  classTeacherId?: number;
  classTeacherName?: string;
  students?: Student[];
  studentCount?: number;
}

// Guardian Types
export interface Guardian {
  id: number;
  name: string;
  relationship: string;
  phoneNumber: string;
  whatsappNumber?: string;
  primaryGuardian: boolean;
  student: Student;
}

export interface GuardianDTO {
  id?: number;
  name: string;
  relationship: string;
  phoneNumber: string;
  whatsappNumber?: string;
  primaryGuardian: boolean;
}

// Assessment Types
export interface Assessment {
  id: number;
  title: string;
  date: string;
  score: number;
  maxScore: number;
  type: AssessmentType;
  term: string;
  academicYear: string;
  studentId: number;
  studentFirstName: string;
  studentLastName: string;
  studentForm: string;
  studentSection: string;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  percentage: number;
}

export interface AssessmentDTO {
  studentId: number;
  subjectId: number;
  title: string;
  date: string;
  score: number;
  maxScore: number;
  type: AssessmentType;
  term: string;
  academicYear: string;
}

export interface AssessmentUpdateDTO {
  title: string;
  date: string;
  score: number;
  maxScore: number;
}

export enum AssessmentType {
  COURSEWORK = 'COURSEWORK',
  FINAL_EXAM = 'FINAL_EXAM'
}

// Student Subject Types
export interface StudentSubject {
  id: number;
  student: Student;
  subject: Subject;
  assignedDate: string;
  assessments?: Assessment[];
}

// Attendance Types
export interface Attendance {
  id: number;
  student: Student;
  date: string;
  present: boolean;
  markedBy?: Teacher;
  markedAt: string;
}

// Report Types
export interface Report {
  id: number;
  student: Student;
  classGroup: ClassGroup;
  term: string;
  academicYear: string;
  subjectReports: SubjectReport[];
  overallComment?: string;
  overallCommentBy?: Teacher;
  finalized: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectReport {
  id: number;
  subject: Subject;
  courseworkMark: number;
  examMark: number;
  finalMark: number;
  comment?: string;
  commentBy?: Teacher; // The teacher who added the subject comment
}

// Promotion Types
export interface PromotionToALevelDTO {
  studentIds: number[];
  subjectIds: number[];
  form: string;
  section: string;
}

// Comment Types
export interface SubjectCommentDTO {
  subjectId: number;
  comment: string;
}

export interface OverallCommentDTO {
  comment: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'file' | 'checkbox' | 'number' | 'date';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
}

// Navigation Types
export interface NavigationItem {
  name: string;
  href: string;
  icon?: string;
  current?: boolean;
  children?: NavigationItem[];
  roles?: ERole[];
}

// Dashboard Types
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalClasses: number;
  attendanceRate: number;
  recentActivities: ActivityItem[];
}

export interface ActivityItem {
  id: number;
  type: 'attendance' | 'assessment' | 'registration' | 'assignment';
  description: string;
  timestamp: string;
  user?: string;
}

// Constants
export const FORMS = {
  JUNIOR_SECONDARY: ['Form 1', 'Form 2'],
  O_LEVEL: ['Form 3', 'Form 4'],
  A_LEVEL: ['Form 5', 'Form 6']
};

export const LEVELS = {
  JUNIOR_SECONDARY: 'JUNIOR_SECONDARY',
  O_LEVEL: 'O_LEVEL',
  A_LEVEL: 'A_LEVEL'
};

export const TERMS = ['Term 1', 'Term 2', 'Term 3'];

export const GRADES = {
  O_LEVEL: ['A', 'B', 'C', 'D', 'E', 'U'],
  A_LEVEL_LETTERS: ['A', 'B', 'C', 'D', 'E', 'U'],
  A_LEVEL_POINTS: [5, 4, 3, 2, 1, 0]
};

export const SUBJECT_CATEGORIES = {
  [SubjectCategory.JUNIOR_SECONDARY_LANGUAGES]: 'Languages',
  [SubjectCategory.JUNIOR_SECONDARY_ARTS]: 'Arts',
  [SubjectCategory.JUNIOR_SECONDARY_SCIENCES]: 'Sciences',
  [SubjectCategory.O_LEVEL_LANGUAGES]: 'Languages',
  [SubjectCategory.O_LEVEL_ARTS]: 'Arts',
  [SubjectCategory.O_LEVEL_COMMERCIALS]: 'Commercials',
  [SubjectCategory.O_LEVEL_SCIENCES]: 'Sciences',
  [SubjectCategory.A_LEVEL_ARTS]: 'Arts',
  [SubjectCategory.A_LEVEL_COMMERCIALS]: 'Commercials',
  [SubjectCategory.A_LEVEL_SCIENCES]: 'Sciences'
};

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type CreateDTO<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateDTO<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

// Error Types
export interface ApiError {
  message: string;
  field?: string;
  code?: string;
  timestamp?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  rejectedValue?: any;
}

// Theme Types
export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  logoPath?: string;
  backgroundPath?: string;
}

// Fee Payment Types
export * from './feePayment';

// Section Types
export * from './section';
