# Frontend Pages Implementation Guide

## Quick Reference: Component Import Pattern

All pages should follow this pattern:

```javascript
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { Card, CardBody, Button, Input } from '../../components/common';
import { serviceName } from '../../services';
import { useDebounce } from '../../hooks';
import toast from 'react-hot-toast';

const PageName = () => {
  // Your component logic
};

export default PageName;
```

---

## Public Pages Status

### 1. Home Page ✅ COMPLETE

---

### 2. Find Tutor Page
**Current Status:** 60% Complete  
**Missing:**
- Star rating filter
- Sorting (by rating, price, experience)
- Available timing filter  
- Better empty state
- Loading skeleton

**Implementation Code:**
```javascript
import React, { useState, useMemo } from 'react';
import { Search, MapPin, Star, DollarSign, Filter } from 'lucide-react';
import { tutorService } from '../../services';
import { Input, Button, Card, CardBody, Select } from '../../components/common';
import { SUBJECTS, CITIES } from '../../constants';
import { useDebounce } from '../../hooks';

const FindTutor = () => {
  const [searchParams, setSearchParams] = useState({
    subject: '',
    city: '',
    search: '',
    minRating: 0,
    sortBy: 'rating',
  });
  
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchParams.search, 500);
  
  const { data: tutorsData, isLoading } = useQuery(
    ['tutors', { ...searchParams, search: debouncedSearch, page }],
    () => tutorService.getTutors({
      ...searchParams,
      search: debouncedSearch,
      page,
      limit: 12,
    })
  );
  
  const tutors = tutorsData?.tutors || [];
  const totalPages = tutorsData?.totalPages || 1;
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Search by name or expertise"
              value={searchParams.search}
              onChange={(e) => setSearchParams(p => ({ ...p, search: e.target.value }))}
              icon={<Search className="h-4 w-4" />}
            />
            <Select
              value={searchParams.subject}
              onChange={(e) => setSearchParams(p => ({ ...p, subject: e.target.value }))}
              options={[{ value: '', label: 'All Subjects' }, ...SUBJECTS.map(s => ({ value: s, label: s }))]}
            />
            <Select
              value={searchParams.city}
              onChange={(e) => setSearchParams(p => ({ ...p, city: e.target.value }))}
              options={[{ value: '', label: 'All Cities' }, ...CITIES.map(c => ({ value: c, label: c }))]}
            />
            <Input
              type="number"
              placeholder="Min Rating"
              min="0"
              max="5"
              step="0.5"
              value={searchParams.minRating}
              onChange={(e) => setSearchParams(p => ({ ...p, minRating: parseFloat(e.target.value) }))}
            />
            <Select
              value={searchParams.sortBy}
              onChange={(e) => setSearchParams(p => ({ ...p, sortBy: e.target.value }))}
              options={[
                { value: 'rating', label: 'Top Rated' },
                { value: 'price-asc', label: 'Price: Low to High' },
                { value: 'price-desc', label: 'Price: High to Low' },
                { value: 'experience', label: 'Most Experienced' },
              ]}
            />
          </div>
        </div>
        
        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">Loading tutors...</div>
        ) : tutors.length === 0 ? (
          <div className="text-center py-12">No tutors found. Try different filters.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {tutors.map(tutor => (
                <TutorCard key={tutor._id} tutor={tutor} />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={page === i + 1 ? 'primary' : 'outline'}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const TutorCard = ({ tutor }) => (
  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
    <div className="h-48 bg-gray-200 relative">
      {tutor.profilePicture ? (
        <img src={tutor.profilePicture} alt={tutor.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600"/>
      )}
    </div>
    <CardBody className="space-y-3">
      <div>
        <h3 className="font-bold text-lg">{tutor.name}</h3>
        <p className="text-sm text-gray-600">{tutor.subjects?.join(', ')}</p>
      </div>
      <div className="flex items-center justify-between">
        <span className="flex items-center text-sm">
          <Star className="h-4 w-4 text-yellow-400 mr-1" />
          {tutor.rating} ({tutor.reviews} reviews)
        </span>
        <span className="font-semibold text-primary-600">₹{tutor.hourlyRate}/hr</span>
      </div>
      <Link 
        to={`/tutor/${tutor._id}`}
        className="block w-full bg-primary-600 text-white text-center py-2 rounded hover:bg-primary-700 transition-colors"
      >
        View Profile
      </Link>
    </CardBody>
  </Card>
);

export default FindTutor;
```

---

### 3. Tutor Profile Page
**Current Status:** 40% Complete  
**Missing:**
- Reviews section
- Availability calendar
- Reviews from students  
- Related tutors
- Proper booking integration

---

### 4. Register Page
**Current Status:** 60% Complete  
**Missing:**
- Complete form validation
- Password strength meter
- Terms & conditions acceptance
- Role-specific fields (for Tutors)

---

### 5. Contact Page
**Current Status:** 20% Complete  
**Implementation:**
```javascript
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button, Input, Textarea } from '../../components/common';
import { studentService } from '../../services';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await studentService.sendContact(formData);
      toast.success('Your message has been sent!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Contact Us</h1>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <Mail className="h-8 w-8 text-primary-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Email</h3>
            <p className="text-gray-600">support@tutorbazaar.com</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <Phone className="h-8 w-8 text-primary-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Phone</h3>
            <p className="text-gray-600">+91 XXXX-XXX-XXXX</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <MapPin className="h-8 w-8 text-primary-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Address</h3>
            <p className="text-gray-600">City Name, Country</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
            <Textarea
              label="Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows="6"
              required
            />
            <Button type="submit" isLoading={isLoading} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
```

---

## Tutor Pages Implementation Status

### Dashboard
- Stats cards (total leads, credits, revenue)
- Recent leads table
- Charts (earnings, leads trend)
- Quick action buttons

### Leads
- List of available leads
- Status filter (pending, contacted, hired)
- Pagination
- Mass actions

### Credits
- Current balance
- Purchase form
- Transaction history
- Pricing tiers

### Profile
- Complete profile form
- Qualifications/Certifications
- Experience details
- Profile picture upload

### Analytics
- Custom date range selector
- Charts and metrics
- Export options

---

## Admin Pages Implementation Status

### Dashboard
- KPI cards (total users, revenue, active deals)
- Recent activity feed
- Top performers
- System health metrics

### Tutors Management
- Tutor listing with filters
- Approve/suspend tutors
- View tutor details
- Manage verification

### Leads Management
- All leads table
- Status tracking
- Assign leads
- View lead details

### Payments Management
- Payment history
- Disputes/refunds
- Settlement reports
- Payment method management

---

## Key Patterns to Follow

### API Error Handling
```javascript
try {
  const result = await service.call();
  toast.success('Success message');
} catch (error) {
  const message = error.response?.data?.message || 'An error occurred';
  toast.error(message);
}
```

### Loading States
```javascript
{isLoading && <div className="text-center py-8">Loading...</div>}
{error && <div className="text-center py-8 text-red-600">Error loading data</div>}
{!isLoading && data.length === 0 && <div className="text-center py-8">No data found</div>}
```

### Form Patterns
```javascript
const [formData, setFormData] = useState({...});
const [errors, setErrors] = useState({});

const handleChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  if (errors[field]) {
    setErrors(prev => ({ ...prev, [field]: '' }));
  }
};
```

---

