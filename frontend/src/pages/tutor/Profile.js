import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { User, Mail, Phone, Award, BookOpen, MapPin } from 'lucide-react';
import { tutorService } from '../../services';
import { Button, Card, CardBody, Input, Loading } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { SUBJECTS, CITIES } from '../../constants';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    subjects: user?.subjects || [],
    city: user?.city || '',
    hourlyRate: user?.hourlyRate || '',
    qualifications: user?.qualifications || [],
  });
  const [isEditing, setIsEditing] = useState(false);

  const { mutate: updateProfile, isLoading } = useMutation(
    (data) => tutorService.updateProfile(data),
    {
      onSuccess: () => {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      },
      onError: (error) => toast.error(error.response?.data?.message || 'Failed to update'),
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectToggle = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your tutor profile and qualifications</p>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? 'danger' : 'primary'}>
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {!isEditing ? (
        <Card>
          <CardBody className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{formData.firstName} {formData.lastName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{formData.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{formData.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">City</p>
                  <p className="font-semibold">{formData.city}</p>
                </div>
              </div>
            </div>

            {formData.bio && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Bio</p>
                <p className="text-gray-900">{formData.bio}</p>
              </div>
            )}

            {formData.subjects.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {formData.subjects.map(s => (
                    <span key={s} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {formData.hourlyRate && (
              <div>
                <p className="text-sm text-gray-600">Hourly Rate</p>
                <p className="text-2xl font-bold text-primary-600">₹{formData.hourlyRate}/hour</p>
              </div>
            )}
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>

              <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} required />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select name="city" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Select City</option>
                  {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>

              <Input label="Hourly Rate (₹)" name="hourlyRate" type="number" value={formData.hourlyRate} onChange={handleChange} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Subjects</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SUBJECTS.map(subject => (
                    <label key={subject} className="flex items-center">
                      <input type="checkbox" checked={formData.subjects.includes(subject)} onChange={() => handleSubjectToggle(subject)} className="h-4 w-4" />
                      <span className="ml-2 text-sm">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" placeholder="Tell students about yourself" className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full">Save Changes</Button>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default Profile;
