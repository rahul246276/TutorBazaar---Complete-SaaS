// API Endpoints
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_ME: '/auth/me',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',

  // Tutors
  TUTORS_LIST: '/tutors',
  TUTORS_GET: (id) => `/tutors/${id}`,
  TUTORS_DASHBOARD: '/tutors/dashboard',
  TUTORS_UPDATE: '/tutors/profile',
  TUTORS_LEADS_AVAILABLE: '/tutors/leads/available',
  TUTORS_LEADS_MY: '/tutors/leads/my',
  TUTORS_LEADS_UNLOCK: (id) => `/tutors/leads/${id}/unlock`,
  TUTORS_CREDITS: '/tutors/credits',
  TUTORS_CREDITS_PURCHASE: '/tutors/credits/purchase',
  TUTORS_CREDITS_VERIFY: '/tutors/credits/verify',
  TUTORS_ANALYTICS: '/tutors/analytics',

  // Students
  STUDENTS_ENQUIRY: '/students/enquiry',
  STUDENTS_CONTACT: '/students/contact',
  STUDENTS_PROFILE: '/students/profile',
  STUDENTS_UPDATE: '/students/profile',

  // Leads
  LEADS_LIST: '/leads/search',
  LEADS_GET: (id) => `/leads/${id}`,
  LEADS_STATUS_UPDATE: (id) => `/leads/${id}/status`,
  LEADS_REDISTRIBUTE: (id) => `/leads/${id}/redistribute`,

  // Payments
  PAYMENTS_HISTORY: '/payments/history',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_TUTORS: '/admin/tutors',
  ADMIN_TUTORS_APPROVE: (id) => `/admin/tutors/${id}/approve`,
  ADMIN_TUTORS_SUSPEND: (id) => `/admin/tutors/${id}/suspend`,
  ADMIN_LEADS: '/admin/leads',
  ADMIN_PAYMENTS: '/admin/payments',
};

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  TUTOR: 'tutor',
  ADMIN: 'admin',
};

// Lead Status
export const LEAD_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  CLOSED: 'closed',
  EXPIRED: 'expired',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Subjects List
export const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'Computer Science',
  'History',
  'Geography',
  'Economics',
  'Accountancy',
  'Business Studies',
  'Psychology',
  'Sociology',
  'Political Science',
  'Aptitude',
];

// Cities List
export const CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Kanpur',
  'Nagpur',
  'Indore',
  'Thane',
  'Bhopal',
];

// Tutor Categories
export const TUTOR_CATEGORIES = [
  'School Tutor',
  'College Tutor',
  'Competitive Exam Coach',
  'Professional Coach',
  'Language Tutor',
];

// Grade Levels
export const GRADES = [
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
  'Graduation',
  'Post Graduation',
];

// Credit Plans
export const CREDIT_PLANS = [
  { credits: 5, price: 299, popular: false },
  { credits: 10, price: 499, popular: true },
  { credits: 25, price: 999, popular: false },
  { credits: 50, price: 1899, popular: false },
];

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  DISPLAY_TIME: 'dd MMM yyyy, HH:mm',
  INPUT: 'yyyy-MM-dd',
  API: "yyyy-MM-dd'T'HH:mm:ss",
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[6-9]\d{9}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  BIO_MAX_LENGTH: 500,
};

// Success & Error Messages
export const MESSAGES = {
  // Success
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful!',
  UPDATE_SUCCESS: 'Updated successfully!',
  DELETE_SUCCESS: 'Deleted successfully!',
  PAYMENT_SUCCESS: 'Payment successful!',
  LOGOUT_SUCCESS: 'Logged out successfully!',

  // Errors
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  REGISTER_FAILED: 'Registration failed. Please try again.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  WEAK_PASSWORD: 'Password must be at least 6 characters long.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [5, 10, 25, 50],
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};
