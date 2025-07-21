// src/constants/index.ts
import { ERole, SubjectCategory } from '../types';

// Academic Constants
export const ACADEMIC_LEVELS = {
  O_LEVEL: 'O_LEVEL',
  A_LEVEL: 'A_LEVEL'
} as const;

export const FORMS = {
  O_LEVEL: ['Form 1', 'Form 2', 'Form 3', 'Form 4'],
  A_LEVEL: ['Form 5', 'Form 6']
} as const;

export const TERMS = ['Term 1', 'Term 2', 'Term 3'] as const;

export const CURRENT_ACADEMIC_YEAR = new Date().getFullYear().toString();

// Section/Class name examples (configurable by school)
export const DEFAULT_SECTIONS = {
  LETTERS: ['A', 'B', 'C', 'D', 'E'],
  COLORS: ['Blue', 'Green', 'Red', 'Yellow', 'Purple'],
  NUMBERS: ['1', '2', '3', '4', '5']
} as const;

// Grading Systems
export const GRADES = {
  O_LEVEL: ['A', 'B', 'C', 'D', 'E', 'U'],
  A_LEVEL_LETTERS: ['A', 'B', 'C', 'D', 'E', 'U'],
  A_LEVEL_POINTS: [5, 4, 3, 2, 1, 0]
} as const;

// Grade Point Mappings
export const GRADE_POINTS = {
  'A': 5,
  'B': 4,
  'C': 3,
  'D': 2,
  'E': 1,
  'U': 0
} as const;

// Subject Categories
export const SUBJECT_CATEGORIES = {
  [SubjectCategory.O_LEVEL_LANGUAGES]: 'Languages',
  [SubjectCategory.O_LEVEL_ARTS]: 'Arts',
  [SubjectCategory.O_LEVEL_COMMERCIALS]: 'Commercials',
  [SubjectCategory.O_LEVEL_SCIENCES]: 'Sciences',
  [SubjectCategory.A_LEVEL_ARTS]: 'Arts',
  [SubjectCategory.A_LEVEL_COMMERCIALS]: 'Commercials',
  [SubjectCategory.A_LEVEL_SCIENCES]: 'Sciences'
} as const;

// O-Level Subjects by Category
export const O_LEVEL_SUBJECTS = {
  LANGUAGES: [
    { name: 'English', code: 'ENG' },
    { name: 'Shona', code: 'SHO' },
    { name: 'Ndebele', code: 'NDE' }
  ],
  ARTS: [
    { name: 'History', code: 'HIS' },
    { name: 'Family and Religious Studies', code: 'FRS' },
    { name: 'Heritage Studies', code: 'HER' },
    { name: 'Literature in English', code: 'LIT' }
  ],
  COMMERCIALS: [
    { name: 'Principles of Accounts', code: 'POA' },
    { name: 'Commerce', code: 'COM' },
    { name: 'Business Enterprise Skills', code: 'BES' },
    { name: 'Economics', code: 'ECO' }
  ],
  SCIENCES: [
    { name: 'Mathematics', code: 'MAT' },
    { name: 'Combined Science', code: 'CSC' },
    { name: 'Biology', code: 'BIO' },
    { name: 'Chemistry', code: 'CHE' },
    { name: 'Physics', code: 'PHY' },
    { name: 'Geography', code: 'GEO' },
    { name: 'Agriculture', code: 'AGR' }
  ]
} as const;

// A-Level Subjects by Category
export const A_LEVEL_SUBJECTS = {
  ARTS: [
    { name: 'History', code: 'HIS' },
    { name: 'Family and Religious Studies', code: 'FRS' },
    { name: 'Indigenous Language (Shona)', code: 'SHO' },
    { name: 'Indigenous Language (Ndebele)', code: 'NDE' },
    { name: 'Literature in English', code: 'LIT_ENG' },
    { name: 'Literature in Ndebele', code: 'LIT_NDE' },
    { name: 'Literature in Shona', code: 'LIT_SHO' },
    { name: 'Heritage Studies', code: 'HER' },
    { name: 'Sociology', code: 'SOC' }
  ],
  COMMERCIALS: [
    { name: 'Accounting', code: 'ACC' },
    { name: 'Business Studies', code: 'BST' },
    { name: 'Business Enterprise Skills', code: 'BES' },
    { name: 'Economics', code: 'ECO' }
  ],
  SCIENCES: [
    { name: 'Pure Mathematics', code: 'PMAT' },
    { name: 'Statistics', code: 'STA' },
    { name: 'Geography', code: 'GEO' },
    { name: 'Biology', code: 'BIO' },
    { name: 'Chemistry', code: 'CHE' },
    { name: 'Physics', code: 'PHY' },
    { name: 'Agriculture', code: 'AGR' }
  ]
} as const;

// Assessment Types
export const ASSESSMENT_TYPES = {
  COURSEWORK: 'COURSEWORK',
  FINAL_EXAM: 'FINAL_EXAM'
} as const;

// Assessment Type Labels
export const ASSESSMENT_TYPE_LABELS = {
  [ASSESSMENT_TYPES.COURSEWORK]: 'Coursework',
  [ASSESSMENT_TYPES.FINAL_EXAM]: 'Final Exam'
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: ERole.ROLE_ADMIN,
  CLERK: ERole.ROLE_CLERK,
  TEACHER: ERole.ROLE_TEACHER,
  CLASS_TEACHER: ERole.ROLE_CLASS_TEACHER
} as const;

// Role Labels
export const ROLE_LABELS = {
  [ERole.ROLE_ADMIN]: 'Administrator',
  [ERole.ROLE_CLERK]: 'Clerk',
  [ERole.ROLE_TEACHER]: 'Teacher',
  [ERole.ROLE_CLASS_TEACHER]: 'Class Teacher'
} as const;

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SETUP: '/setup',
  DASHBOARD: '/app',
  STUDENTS: '/app/students',
  TEACHERS: '/app/teachers',
  CLASSES: '/app/classes',
  SUBJECTS: '/app/subjects',
  ASSESSMENTS: '/app/assessments',
  REPORTS: '/app/reports',
  ATTENDANCE: '/app/attendance',
  GUARDIANS: '/app/guardians',
  FEES_PAYMENT: '/app/fees/payment',
  FEES_STATUS: '/app/fees/status',
  FEES_REPORTS: '/app/fees/reports',
  FEES_SETTINGS: '/app/fees/settings',
  SECTIONS: '/app/sections',
  USERS: '/app/users',
  PROFILE: '/app/profile',
  SETTINGS: '/app/settings'
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    CHECK_SETUP: '/auth/check-school-setup'
  },
  SCHOOL: {
    CONFIG: '/school/config',
    SETUP: '/school/setup'
  },
  STUDENTS: {
    BASE: '/students',
    ALL: '/students/all',
    BY_CLASS: '/students/form/:form/section/:section',
    ASSIGN_SUBJECT: '/students/:id/assign-subject/:subjectId',
    SUBJECTS: '/students/:id/subjects'
  },
  TEACHERS: {
    BASE: '/teachers',
    ALL: '/teachers/all',
    CURRENT: '/teachers/current',
    ASSIGNMENTS: '/teachers/subjects/assigned',
    SUPERVISED_CLASSES: '/teachers/class-teacher-assignments'
  },
  SUBJECTS: {
    BASE: '/subjects',
    ALL: '/subjects/all',
    BY_CATEGORY: '/subjects/category/:category',
    BY_LEVEL: '/subjects/level/:level'
  },
  ASSESSMENTS: {
    BASE: '/assessments',
    BY_STUDENT_SUBJECT: '/assessments/student/:studentId/subject/:subjectId',
    BY_STUDENT_TERM: '/assessments/student/:studentId/term/:term/year/:year'
  },
  REPORTS: {
    BASE: '/reports',
    GENERATE: '/reports/generate/class/:classId/term/:term/year/:year',
    BY_STUDENT: '/reports/student/:studentId',
    SUBJECT_COMMENT: '/reports/:id/subject-comment',
    OVERALL_COMMENT: '/reports/:id/overall-comment',
    FINALIZE: '/reports/:id/finalize'
  },
  ATTENDANCE: {
    BASE: '/attendance',
    BY_STUDENT: '/attendance/student/:studentId',
    BY_DATE: '/attendance/date/:date'
  },
  GUARDIANS: {
    BASE: '/guardians',
    BY_STUDENT: '/guardians/student/:studentId'
  }
} as const;

// Form Validation Rules
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    MESSAGE: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address'
  },
  PHONE: {
    PATTERN: /^[\+]?[0-9]{10,15}$/,
    MESSAGE: 'Please enter a valid phone number'
  },
  STUDENT_ID: {
    PATTERN: /^[A-Z0-9]{4,10}$/,
    MESSAGE: 'Student ID must be 4-10 characters long and contain only uppercase letters and numbers'
  },
  EMPLOYEE_ID: {
    PATTERN: /^[A-Z0-9]{4,10}$/,
    MESSAGE: 'Employee ID must be 4-10 characters long and contain only uppercase letters and numbers'
  }
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  FULL: 'MMMM dd, yyyy',
  SHORT: 'MM/dd/yyyy'
} as const;

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }
} as const;

// Default Colors for School Setup
export const DEFAULT_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#10B981',
  ACCENT: '#F59E0B',
  NEUTRAL: '#6B7280'
} as const;

// WhatsApp Integration
export const WHATSAPP = {
  API_URL: 'https://api.whatsapp.com/send',
  MESSAGE_TEMPLATES: {
    ATTENDANCE: (studentName: string, date: string) => 
      `Hello, this is to inform you that ${studentName} was absent from school on ${date}. Please contact the school if you have any concerns.`,
    REPORT_READY: (studentName: string, term: string) => 
      `Hello, ${studentName}'s report for ${term} is now ready for collection. Please visit the school office.`
  }
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'An internal server error occurred. Please try again later.',
  SCHOOL_NOT_CONFIGURED: 'School configuration is required before accessing this feature.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  LOGOUT: 'Successfully logged out!',
  SCHOOL_SETUP: 'School configuration completed successfully!',
  STUDENT_CREATED: 'Student registered successfully!',
  TEACHER_CREATED: 'Teacher registered successfully!',
  ASSESSMENT_RECORDED: 'Assessment recorded successfully!',
  ATTENDANCE_MARKED: 'Attendance marked successfully!',
  REPORT_GENERATED: 'Report generated successfully!',
  COMMENT_ADDED: 'Comment added successfully!',
  REPORT_FINALIZED: 'Report finalized successfully!'
} as const;