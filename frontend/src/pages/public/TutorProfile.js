import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Star, MapPin, Award, DollarSign, MessageSquare } from 'lucide-react';
import { tutorService } from '../../services';
import { Button, Loading, Card, CardBody } from '../../components/common';
import { formatCurrency, formatRating, getRatingColor } from '../../utils/formatters';

const TutorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: tutor, isLoading, error } = useQuery(['tutor', id], () => tutorService.getTutor(id));

  if (isLoading) return <Loading message="Loading tutor profile..." />;

  if (error || !tutor) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Tutor not found or error loading profile</p>
          <Button onClick={() => navigate('/find-tutor')}>Back to Search</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Button variant="secondary" onClick={() => navigate('/find-tutor')} className="mb-6">
        Back to Search
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardBody className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {tutor.firstName} {tutor.lastName}
                  </h1>
                  <p className="text-gray-600 mt-1">{tutor.headline || 'Professional Tutor'}</p>
                </div>
                {tutor.rating > 0 && (
                  <div className="flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    <div>
                      <p className={`font-bold ${getRatingColor(tutor.rating)}`}>{formatRating(tutor.rating)}</p>
                      <p className="text-xs text-gray-600">({tutor.reviewCount || 0} reviews)</p>
                    </div>
                  </div>
                )}
              </div>

              {tutor.bio && <p className="text-gray-700 leading-relaxed">{tutor.bio}</p>}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tutor.city && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-5 w-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-medium">{tutor.city}</p>
                    </div>
                  </div>
                )}
                {tutor.hourlyRate > 0 && (
                  <div className="flex items-start space-x-2">
                    <DollarSign className="h-5 w-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Hourly Rate</p>
                      <p className="font-medium">{formatCurrency(tutor.hourlyRate)}</p>
                    </div>
                  </div>
                )}
                {tutor.pricing?.monthlyRate > 0 && (
                  <div className="flex items-start space-x-2">
                    <Award className="h-5 w-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Monthly Package</p>
                      <p className="font-medium">{formatCurrency(tutor.pricing.monthlyRate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {tutor.subjects?.length > 0 && (
            <Card>
              <CardBody>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Subjects</h2>
                <div className="flex flex-wrap gap-2">
                  {tutor.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardBody className="space-y-4">
              <Button className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => navigate('/enquiry')}>
                Post Requirement
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TutorProfile;
