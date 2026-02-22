import { VALIDATION, MESSAGES } from '../constants';

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!VALIDATION.EMAIL_REGEX.test(email)) return MESSAGES.INVALID_EMAIL;
  return '';
};

export const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required';
  if (!VALIDATION.PHONE_REGEX.test(phone)) return MESSAGES.INVALID_PHONE;
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return MESSAGES.WEAK_PASSWORD;
  }
  return '';
};

export const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.length < VALIDATION.NAME_MIN_LENGTH) {
    return 'Name must be at least 2 characters long';
  }
  return '';
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return MESSAGES.PASSWORDS_DONT_MATCH;
  }
  return '';
};

export const validateLoginForm = (email, password) => {
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  
  if (emailError || passwordError) {
    return {
      isValid: false,
      errors: { email: emailError, password: passwordError },
    };
  }
  
  return { isValid: true, errors: {} };
};

export const validateRegistrationForm = (data) => {
  const errors = {};
  
  if (!data.firstName) errors.firstName = 'First name is required';
  if (!data.lastName) errors.lastName = 'Last name is required';
  
  errors.email = validateEmail(data.email);
  errors.phone = validatePhone(data.phone);
  errors.password = validatePassword(data.password);
  
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = MESSAGES.PASSWORDS_DONT_MATCH;
  }
  
  if (!data.role) errors.role = 'Please select a role';
  
  // Remove empty error entries
  Object.keys(errors).forEach(key => !errors[key] && delete errors[key]);
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateEnquiryForm = (data) => {
  const errors = {};
  
  if (!data.title) errors.title = 'Title is required';
  if (!data.description) errors.description = 'Description is required';
  if (!data.subject) errors.subject = 'Subject is required';
  if (!data.location) errors.location = 'Location is required';
  
  errors.email = validateEmail(data.email);
  errors.phone = validatePhone(data.phone);
  
  Object.keys(errors).forEach(key => !errors[key] && delete errors[key]);
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateTutorProfileForm = (data) => {
  const errors = {};
  
  errors.email = validateEmail(data.email);
  errors.phone = validatePhone(data.phone);
  
  if (!data.qualifications || data.qualifications.length === 0) {
    errors.qualifications = 'At least one qualification is required';
  }
  
  if (!data.subjects || data.subjects.length === 0) {
    errors.subjects = 'At least one subject is required';
  }
  
  if (!data.hourlyRate || data.hourlyRate <= 0) {
    errors.hourlyRate = 'Please enter a valid hourly rate';
  }
  
  Object.keys(errors).forEach(key => !errors[key] && delete errors[key]);
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
