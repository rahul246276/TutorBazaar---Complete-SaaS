import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { tutorService } from '../../services';
import { Button, Card, CardBody, Input, Loading } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { SUBJECTS, CITIES } from '../../constants';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    subjects: [],
    city: '',
    hourlyRate: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        subjects: (user.subjects || []).map((subject) => (typeof subject === 'string' ? subject : subject?.name)).filter(Boolean),
        city: user.city || '',
        hourlyRate: user.pricing?.hourlyRate || user.hourlyRate || '',
      });
    }
  }, [user]);

  const { mutate: updateProfile, isLoading: isSaving } = useMutation(
    (payload) => tutorService.updateProfile(payload),
    {
      onSuccess: () => {
        toast.success('Profile updated successfully');
        updateUser({ firstName: formData.firstName, lastName: formData.lastName, city: formData.city });
        setIsEditing(false);
      },
      onError: (error) => toast.error(error.response?.data?.message || 'Failed to update profile'),
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectToggle = (subject) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      bio: formData.bio,
      city: formData.city,
      subjects: formData.subjects.map((name) => ({ name })),
      pricing: {
        hourlyRate: Number(formData.hourlyRate) || 0,
      },
    });
  };

  if (!user) return <Loading message="Loading profile..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your tutor profile and public details.</p>
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
                  <p className="font-semibold">
                    {formData.firstName} {formData.lastName}
                  </p>
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

              <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} required />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select City</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <Input label="Hourly Rate (Rs)" name="hourlyRate" type="number" value={formData.hourlyRate} onChange={handleChange} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Subjects</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SUBJECTS.map((subject) => (
                    <label key={subject} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject)}
                        onChange={() => handleSubjectToggle(subject)}
                        className="h-4 w-4"
                      />
                      <span className="ml-2 text-sm">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell students about yourself"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <Button type="submit" isLoading={isSaving} className="w-full">
                Save Changes
              </Button>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default Profile;
