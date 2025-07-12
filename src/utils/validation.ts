import { VALIDATION_RULES } from '../constants';
import type { SchoolConfigDTO } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): FieldValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!VALIDATION_RULES.EMAIL.PATTERN.test(email)) {
    return { isValid: false, message: VALIDATION_RULES.EMAIL.MESSAGE };
  }
  
  return { isValid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): FieldValidationResult {
  if (!password || password.trim() === '') {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return { isValid: false, message: `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters long` };
  }
  
  if (!VALIDATION_RULES.PASSWORD.PATTERN.test(password)) {
    return { isValid: false, message: VALIDATION_RULES.PASSWORD.MESSAGE };
  }
  
  return { isValid: true };
}

/**
 * Validate password confirmation
 */
export function validatePasswordConfirmation(password: string, confirmPassword: string): FieldValidationResult {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { isValid: false, message: 'Password confirmation is required' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }
  
  return { isValid: true };
}

/**
 * Validate phone number format
 */
export function validatePhone(phone: string): FieldValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  if (!VALIDATION_RULES.PHONE.PATTERN.test(phone)) {
    return { isValid: false, message: VALIDATION_RULES.PHONE.MESSAGE };
  }
  
  return { isValid: true };
}

/**
 * Validate student ID format
 */
export function validateStudentId(studentId: string): FieldValidationResult {
  if (!studentId || studentId.trim() === '') {
    return { isValid: false, message: 'Student ID is required' };
  }
  
  if (!VALIDATION_RULES.STUDENT_ID.PATTERN.test(studentId)) {
    return { isValid: false, message: VALIDATION_RULES.STUDENT_ID.MESSAGE };
  }
  
  return { isValid: true };
}

/**
 * Validate employee ID format
 */
export function validateEmployeeId(employeeId: string): FieldValidationResult {
  if (!employeeId || employeeId.trim() === '') {
    return { isValid: false, message: 'Employee ID is required' };
  }
  
  if (!VALIDATION_RULES.EMPLOYEE_ID.PATTERN.test(employeeId)) {
    return { isValid: false, message: VALIDATION_RULES.EMPLOYEE_ID.MESSAGE };
  }
  
  return { isValid: true };
}

/**
 * Validate required field
 */
export function validateRequired(value: any, fieldName: string): FieldValidationResult {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  return { isValid: true };
}

/**
 * Validate minimum length
 */
export function validateMinLength(value: string, minLength: number, fieldName: string): FieldValidationResult {
  if (!value || value.length < minLength) {
    return { isValid: false, message: `${fieldName} must be at least ${minLength} characters long` };
  }
  
  return { isValid: true };
}

/**
 * Validate maximum length
 */
export function validateMaxLength(value: string, maxLength: number, fieldName: string): FieldValidationResult {
  if (value && value.length > maxLength) {
    return { isValid: false, message: `${fieldName} must be no more than ${maxLength} characters long` };
  }
  
  return { isValid: true };
}

/**
 * Validate numeric value
 */
export function validateNumeric(value: any, fieldName: string): FieldValidationResult {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  if (isNaN(Number(value))) {
    return { isValid: false, message: `${fieldName} must be a valid number` };
  }
  
  return { isValid: true };
}

/**
 * Validate numeric range
 */
export function validateNumericRange(value: number, min: number, max: number, fieldName: string): FieldValidationResult {
  if (value < min || value > max) {
    return { isValid: false, message: `${fieldName} must be between ${min} and ${max}` };
  }
  
  return { isValid: true };
}

/**
 * Validate date format
 */
export function validateDate(dateString: string, fieldName: string): FieldValidationResult {
  if (!dateString || dateString.trim() === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { isValid: false, message: `${fieldName} must be a valid date` };
  }
  
  return { isValid: true };
}

/**
 * Validate date range
 */
export function validateDateRange(startDate: string, endDate: string): FieldValidationResult {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    return { isValid: false, message: 'Start date must be before end date' };
  }
  
  return { isValid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeInMB: number): FieldValidationResult {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  
  if (file.size > maxSizeInBytes) {
    return { isValid: false, message: `File size must be less than ${maxSizeInMB}MB` };
  }
  
  return { isValid: true };
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): FieldValidationResult {
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, message: `File type must be one of: ${allowedTypes.join(', ')}` };
  }
  
  return { isValid: true };
}

/**
 * Validate hex color
 */
export function validateHexColor(color: string): FieldValidationResult {
  if (!color || color.trim() === '') {
    return { isValid: false, message: 'Color is required' };
  }
  
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexPattern.test(color)) {
    return { isValid: false, message: 'Color must be a valid hex color (e.g., #FF0000)' };
  }
  
  return { isValid: true };
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): FieldValidationResult {
  if (!url || url.trim() === '') {
    return { isValid: true }; // URL is optional
  }
  
  const urlPattern = /^https?:\/\/.+/;
  if (!urlPattern.test(url)) {
    return { isValid: false, message: 'URL must start with http:// or https://' };
  }
  
  return { isValid: true };
}

/**
 * Validate school configuration
 */
export function validateSchoolConfig(config: SchoolConfigDTO): ValidationResult {
  const errors: string[] = [];
  
  // Required fields
  const requiredFields = [
    { field: config.name, name: 'School name' },
    { field: config.primaryColor, name: 'Primary color' },
    { field: config.secondaryColor, name: 'Secondary color' },
    { field: config.contactEmail, name: 'Contact email' },
    { field: config.contactPhone, name: 'Contact phone' },
    { field: config.address, name: 'Address' }
  ];
  
  requiredFields.forEach(({ field, name }) => {
    const result = validateRequired(field, name);
    if (!result.isValid) {
      errors.push(result.message!);
    }
  });
  
  // Validate email
  if (config.contactEmail) {
    const emailResult = validateEmail(config.contactEmail);
    if (!emailResult.isValid) {
      errors.push(emailResult.message!);
    }
  }
  
  // Validate phone
  if (config.contactPhone) {
    const phoneResult = validatePhone(config.contactPhone);
    if (!phoneResult.isValid) {
      errors.push(phoneResult.message!);
    }
  }
  
  // Validate colors
  if (config.primaryColor) {
    const colorResult = validateHexColor(config.primaryColor);
    if (!colorResult.isValid) {
      errors.push(`Primary ${colorResult.message!.toLowerCase()}`);
    }
  }
  
  if (config.secondaryColor) {
    const colorResult = validateHexColor(config.secondaryColor);
    if (!colorResult.isValid) {
      errors.push(`Secondary ${colorResult.message!.toLowerCase()}`);
    }
  }
  
  // Validate website URL if provided
  if (config.website) {
    const urlResult = validateUrl(config.website);
    if (!urlResult.isValid) {
      errors.push(urlResult.message!);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
