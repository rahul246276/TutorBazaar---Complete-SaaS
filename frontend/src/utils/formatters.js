export const getInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

export const getFullName = (firstName, lastName) => {
  return `${firstName || ''} ${lastName || ''}`.trim();
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const capitalizeFirstLetter = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const getGradeLabel = (grade) => {
  const gradeMap = {
    '6-8': 'Classes 6-8',
    '9-10': 'Classes 9-10',
    '11-12': 'Classes 11-12',
    'graduation': 'Graduation',
    'postgraduation': 'Post Graduation',
  };
  return gradeMap[grade] || grade;
};

export const formatRating = (rating) => {
  if (!rating) return '0';
  return parseFloat(rating).toFixed(1);
};

export const getRatingColor = (rating) => {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 4) return 'text-emerald-600';
  if (rating >= 3) return 'text-yellow-600';
  return 'text-red-600';
};

export const formatCurrency = (amount, currency = '₹') => {
  if (!amount && amount !== 0) return currency + '0';
  return currency + amount.toLocaleString('en-IN');
};

export const getStatusColor = (status) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
    open: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    expired: 'bg-red-100 text-red-800',
    in_progress: 'bg-blue-100 text-blue-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusText = (status) => {
  const textMap = {
    active: 'Active',
    pending: 'Pending',
    inactive: 'Inactive',
    completed: 'Completed',
    failed: 'Failed',
    open: 'Open',
    closed: 'Closed',
    expired: 'Expired',
    in_progress: 'In Progress',
  };
  return textMap[status] || status;
};
