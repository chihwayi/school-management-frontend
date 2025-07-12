import { clsx, type ClassValue } from 'clsx';
import { format, parseISO } from 'date-fns';
import { GRADES, GRADE_POINTS, DATE_FORMATS, VALIDATION_RULES } from '../constants';
import { ERole, SubjectCategory, AssessmentType } from '../types';

/**
 * Utility function to merge and conditionally apply CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format date string to display format
 */
export function formatDate(dateString: string, formatType: keyof typeof DATE_FORMATS = 'DISPLAY'): string {
  if (!dateString) return '';
  
  try {
    const date = parseISO(dateString);
    return format(date, DATE_FORMATS[formatType]);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Format date for input fields
 */
export function formatDateForInput(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return dateString;
  }
}

/**
 * Get current date in ISO format
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get current academic year
 */
export function getCurrentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth() returns 0-11
  
  // If it's January to August, it's still the previous academic year
  // Academic year runs from September to August
  if (month >= 9) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

/**
 * Get current term based on month
 */
export function getCurrentTerm(): string {
  const month = new Date().getMonth() + 1;
  
  if (month >= 9 || month <= 12) {
    return 'Term 1';
  } else if (month >= 1 && month <= 4) {
    return 'Term 2';
  } else {
    return 'Term 3';
  }
}

/**
 * Calculate grade from percentage
 */
export function calculateGrade(percentage: number, level: 'O_LEVEL' | 'A_LEVEL' = 'O_LEVEL'): string {
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  if (percentage >= 40) return 'E';
  return 'U';
}

/**
 * Calculate grade points from letter grade
 */
export function getGradePoints(grade: string): number {
  return GRADE_POINTS[grade as keyof typeof GRADE_POINTS] || 0;
}

/**
 * Calculate percentage from score and max score
 */
export function calculatePercentage(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
}

/**
 * Calculate average from array of numbers
 */
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return Math.round((sum / numbers.length) * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate weighted average
 */
export function calculateWeightedAverage(values: { score: number; weight: number }[]): number {
  if (values.length === 0) return 0;
  
  const totalWeight = values.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return 0;
  
  const weightedSum = values.reduce((sum, item) => sum + (item.score * item.weight), 0);
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

/**
 * Format student name
 */
export function formatStudentName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

/**
 * Format teacher name
 */
export function formatTeacherName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

/**
 * Generate student display name with ID
 */
export function generateStudentDisplayName(firstName: string, lastName: string, studentId: string): string {
  return `${firstName} ${lastName} (${studentId})`;
}

/**
 * Format class name
 */
export function formatClassName(form: string, section: string): string {
  return `${form}${section}`;
}

/**
 * Format subject category for display
 */
export function formatSubjectCategory(category: SubjectCategory): string {
  const categoryMap: Record<SubjectCategory, string> = {
    [SubjectCategory.O_LEVEL_LANGUAGES]: 'Languages',
    [SubjectCategory.O_LEVEL_ARTS]: 'Arts',
    [SubjectCategory.O_LEVEL_COMMERCIALS]: 'Commercials',
    [SubjectCategory.O_LEVEL_SCIENCES]: 'Sciences',
    [SubjectCategory.A_LEVEL_ARTS]: 'Arts',
    [SubjectCategory.A_LEVEL_COMMERCIALS]: 'Commercials',
    [SubjectCategory.A_LEVEL_SCIENCES]: 'Sciences'
  };
  
  return categoryMap[category] || category;
}

/**
 * Format role name for display
 */
export function formatRoleName(role: ERole): string {
  const roleMap: Record<ERole, string> = {
    [ERole.ROLE_ADMIN]: 'Administrator',
    [ERole.ROLE_CLERK]: 'Clerk',
    [ERole.ROLE_TEACHER]: 'Teacher',
    [ERole.ROLE_CLASS_TEACHER]: 'Class Teacher',
    [ERole.ROLE_USER]: 'User'
  };
  
  return roleMap[role] || role;
}

/**
 * Format assessment type for display
 */
export function formatAssessmentType(type: AssessmentType): string {
  const typeMap: Record<AssessmentType, string> = {
    [AssessmentType.COURSEWORK]: 'Coursework',
    [AssessmentType.FINAL_EXAM]: 'Final Exam'
  };
  
  return typeMap[type] || type;
}



/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Convert string to slug format
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate random string
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(userRoles: ERole[], requiredRoles: ERole[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Sort array by property
 */
export function sortByProperty<T>(array: T[], property: keyof T, ascending: boolean = true): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[property];
    const bValue = b[property];
    
    if (aValue < bValue) return ascending ? -1 : 1;
    if (aValue > bValue) return ascending ? 1 : -1;
    return 0;
  });
}

/**
 * Group array by property
 */
export function groupByProperty<T>(array: T[], property: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = String(item[property]);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Remove duplicates from array
 */
export function removeDuplicates<T>(array: T[], property?: keyof T): T[] {
  if (!property) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const key = item[property];
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${Math.round(size * 100) / 100} ${sizes[i]}`;
}

/**
 * Check if file type is allowed
 */
export function isAllowedFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Format currency (assuming Zimbabwe Dollar)
 */
export function formatCurrency(amount: number, currency: string = 'ZWL'): string {
  return new Intl.NumberFormat('en-ZW', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}

/**
 * Get initials from full name
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as +263 XX XXX XXXX for Zimbabwe numbers
  if (cleaned.startsWith('263')) {
    return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5, 8)} ${cleaned.substring(8)}`;
  }
  
  // Format as 0XX XXX XXXX for local numbers
  if (cleaned.startsWith('0')) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }
  
  return phone;
}

/**
 * Generate WhatsApp message URL
 */
export function generateWhatsAppURL(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Check if current time is within school hours
 */
export function isSchoolHours(): boolean {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Check if it's a weekday (Monday to Friday)
  if (day === 0 || day === 6) return false;
  
  // Check if it's within school hours (7 AM to 5 PM)
  return hour >= 7 && hour < 17;
}

/**
 * Generate attendance message for WhatsApp
 */
export function generateAttendanceMessage(studentName: string, date: string, className: string): string {
  return `Hello, your child ${studentName} from ${className} was marked absent on ${formatDate(date)}. Please contact the school if this is an error.`;
}

/**
 * Get level from form
 */
export function getLevelFromForm(form: string): 'O_LEVEL' | 'A_LEVEL' {
  const formNumber = parseInt(form.replace(/\D/g, ''));
  return formNumber <= 4 ? 'O_LEVEL' : 'A_LEVEL';
}

/**
 * Check if form is valid for level
 */
export function isValidFormForLevel(form: string, level: 'O_LEVEL' | 'A_LEVEL'): boolean {
  const formNumber = parseInt(form.replace(/\D/g, ''));
  
  if (level === 'O_LEVEL') {
    return formNumber >= 1 && formNumber <= 4;
  } else {
    return formNumber >= 5 && formNumber <= 6;
  }
}

/**
 * Get next form for student advancement
 */
export function getNextForm(currentForm: string): string | null {
  const formNumber = parseInt(currentForm.replace(/\D/g, ''));
  
  if (formNumber >= 1 && formNumber < 6) {
    return `Form ${formNumber + 1}`;
  }
  
  return null; // No next form for Form 6
}

/**
 * Check if student can be promoted to A-Level
 */
export function canPromoteToALevel(currentForm: string): boolean {
  const formNumber = parseInt(currentForm.replace(/\D/g, ''));
  return formNumber === 4;
}

/**
 * Get available subjects for level
 */
export function getSubjectCategoriesForLevel(level: 'O_LEVEL' | 'A_LEVEL'): SubjectCategory[] {
  if (level === 'O_LEVEL') {
    return [
      SubjectCategory.O_LEVEL_LANGUAGES,
      SubjectCategory.O_LEVEL_ARTS,
      SubjectCategory.O_LEVEL_COMMERCIALS,
      SubjectCategory.O_LEVEL_SCIENCES
    ];
  } else {
    return [
      SubjectCategory.A_LEVEL_ARTS,
      SubjectCategory.A_LEVEL_COMMERCIALS,
      SubjectCategory.A_LEVEL_SCIENCES
    ];
  }
}

/**
 * Generate report card comment based on performance
 */
export function generatePerformanceComment(average: number): string {
  if (average >= 80) {
    return 'Excellent performance! Keep up the outstanding work.';
  } else if (average >= 70) {
    return 'Very good performance. Continue working hard.';
  } else if (average >= 60) {
    return 'Good performance with room for improvement.';
  } else if (average >= 50) {
    return 'Satisfactory performance. More effort required.';
  } else if (average >= 40) {
    return 'Below average performance. Needs significant improvement.';
  } else {
    return 'Poor performance. Requires immediate attention and support.';
  }
}