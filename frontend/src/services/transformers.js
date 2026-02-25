export const mapTutor = (tutor = {}) => ({
  id: tutor._id || tutor.id,
  firstName: tutor.firstName || '',
  lastName: tutor.lastName || '',
  email: tutor.email || '',
  phone: tutor.phone || '',
  city: tutor.city || '',
  locality: tutor.locality || '',
  bio: tutor.bio || '',
  headline: tutor.headline || '',
  subjects: (tutor.subjects || []).map((subject) => (typeof subject === 'string' ? subject : subject?.name)).filter(Boolean),
  education: tutor.education || [],
  pricing: tutor.pricing || {},
  hourlyRate: tutor.pricing?.hourlyRate || 0,
  rating: tutor.rating?.average || 0,
  reviewCount: tutor.rating?.count || 0,
  profileCompletion: tutor.profileCompletion || 0,
  isApproved: Boolean(tutor.isApproved),
  isFeatured: Boolean(tutor.isFeatured),
  status: tutor.isActive ? 'active' : 'inactive',
});

export const mapLead = (lead = {}) => ({
  id: lead._id || lead.id,
  leadId: lead.leadId,
  status: lead.status,
  title: `${lead.requirements?.class || 'Student'} - ${(lead.requirements?.subjects || []).join(', ')}`,
  description: lead.requirements?.goals || lead.requirements?.specialRequirements || 'New lead',
  subject: (lead.requirements?.subjects || []).join(', '),
  grade: lead.requirements?.class || '',
  location: [lead.requirements?.locality, lead.requirements?.city].filter(Boolean).join(', '),
  city: lead.requirements?.city || '',
  budget: lead.requirements?.budget?.max || lead.requirements?.budget || 0,
  preferredTiming: lead.requirements?.preferredTiming || '',
  studentName: lead.student?.name || '',
  createdAt: lead.createdAt,
});

export const mapPayment = (payment = {}) => ({
  id: payment._id || payment.id,
  orderId: payment.razorpayOrderId || payment.orderId || '',
  amount: payment.amount || 0,
  status: payment.status || '',
  createdAt: payment.createdAt,
  userName: payment.user?.firstName
    ? `${payment.user.firstName} ${payment.user.lastName || ''}`.trim()
    : payment.userName || '',
  type: payment.type || '',
});
