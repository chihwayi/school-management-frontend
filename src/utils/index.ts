import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const formatRoleName = (role?: string): string => {
  if (!role) return 'User';
  return role.replace('ROLE_', '').replace('_', ' ').toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getCurrentAcademicYear = (): string => {
  return new Date().getFullYear().toString();
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getSubjectCategoriesForLevel = (level: string) => {
  if (level === 'JUNIOR_SECONDARY') {
    return [
      { value: 'JUNIOR_SECONDARY_LANGUAGES', label: 'Languages' },
      { value: 'JUNIOR_SECONDARY_ARTS', label: 'Arts' },
      { value: 'JUNIOR_SECONDARY_SCIENCES', label: 'Sciences' }
    ];
  } else if (level === 'O_LEVEL') {
    return [
      { value: 'O_LEVEL_LANGUAGES', label: 'Languages' },
      { value: 'O_LEVEL_ARTS', label: 'Arts' },
      { value: 'O_LEVEL_COMMERCIALS', label: 'Commercials' },
      { value: 'O_LEVEL_SCIENCES', label: 'Sciences' }
    ];
  } else if (level === 'A_LEVEL') {
    return [
      { value: 'A_LEVEL_ARTS', label: 'Arts' },
      { value: 'A_LEVEL_COMMERCIALS', label: 'Commercials' },
      { value: 'A_LEVEL_SCIENCES', label: 'Sciences' }
    ];
  }
  return [];
};

export const getLevelFromForm = (form: string): string => {
  const juniorSecondaryForms = ['Form 1', 'Form 2'];
  const oLevelForms = ['Form 3', 'Form 4'];
  const aLevelForms = ['Form 5', 'Form 6'];
  
  if (juniorSecondaryForms.includes(form)) {
    return 'JUNIOR_SECONDARY';
  } else if (oLevelForms.includes(form)) {
    return 'O_LEVEL';
  } else if (aLevelForms.includes(form)) {
    return 'A_LEVEL';
  }
  return '';
};

export const formatAssessmentType = (type: string): string => {
  return type.replace('_', ' ').toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getCurrentTerm = (): string => {
  const month = new Date().getMonth() + 1;
  if (month >= 1 && month <= 4) return 'Term 1';
  if (month >= 5 && month <= 8) return 'Term 2';
  return 'Term 3';
};

export const generatePerformanceComment = (percentage: number): string => {
  if (percentage >= 80) return 'Excellent performance';
  if (percentage >= 70) return 'Very good performance';
  if (percentage >= 60) return 'Good performance';
  if (percentage >= 50) return 'Satisfactory performance';
  if (percentage >= 40) return 'Fair performance';
  return 'Needs improvement';
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /\d/.test(password);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};