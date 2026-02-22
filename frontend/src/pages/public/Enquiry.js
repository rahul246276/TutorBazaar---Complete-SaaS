import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services';
import { Input, Button, Card, CardBody } from '../../components/common';
import { validateEnquiryForm } from '../../utils/validation';
import { FileText, MapPin, BookOpen, Phone, Mail } from 'lucide-react';
import { SUBJECTS, CITIES, GRADES } from '../../constants';
import toast from 'react-hot-toast';

const Enquiry = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    location: '',
    budget: '',
    email: '',
    phone: '',
    preferredTime: '',
  });
  const [errors, setErrors] = useState({});

  const { mutate: submitEnquiry, isLoading } = useMutation(
    (data) => studentService.createEnquiry(data),
    {
      onSuccess: () => {
        toast.success('Enquiry submitted successfully! We will contact you soon.');
        setTimeout(() => navigate('/'), 2000);
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to submit enquiry';
        setErrors({ submit: message });
        toast.error(message);
      },
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateEnquiryForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    submitEnquiry(formData);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post Your Requirement</h1>
        <p className="text-gray-600">Tell us what you're looking for and we'll connect you with the perfect tutor</p>
      </div>

      <Card>
        <CardBody>
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              placeholder="e.g., Need help with Mathematics for Class 10"
              required
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe your learning needs, goals, and any specific topics"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Subject and Grade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select Subject</option>
                  {SUBJECTS.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade/Level
                </label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Grade</option>
                  {GRADES.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location and Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select City</option>
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-500">{errors.location}</p>
                )}
              </div>

              <Input
                label="Budget (₹/hour)"
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleChange}
                placeholder="Your hourly budget"
              />
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Your Contact Information</h3>
              <div className="space-y-4">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="your@email.com"
                  required
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="10-digit number"
                  required
                />
              </div>
            </div>

            {/* Preferred Time */}
            <Input
              label="Preferred Time for Classes"
              name="preferredTime"
              type="text"
              value={formData.preferredTime}
              onChange={handleChange}
              placeholder="e.g., Weekdays 5-7 PM"
            />

            {/* Submit Button */}
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              <FileText className="mr-2 h-4 w-4" />
              Submit Enquiry
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default Enquiry;
