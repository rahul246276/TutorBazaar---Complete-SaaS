import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Search, MapPin, Star, DollarSign } from 'lucide-react';
import { tutorService } from '../../services';
import { Input, Button, Card, CardBody, Loading, EmptyState } from '../../components/common';
import { SUBJECTS, CITIES } from '../../constants';
import { useDebounce } from '../../hooks';
import { formatCurrency, formatRating, getRatingColor } from '../../utils/formatters';

const FindTutor = () => {
  const [searchParams, setSearchParams] = useState({
    subject: '',
    city: '',
    search: '',
    minRating: 0,
  });

  const debouncedSearch = useDebounce(searchParams.search, 500);

  const { data: tutorsData, isLoading, error } = useQuery(
    ['tutors', { subject: searchParams.subject, city: searchParams.city, search: debouncedSearch }],
    () =>
      tutorService.getTutors({
        subject: searchParams.subject,
        city: searchParams.city,
        search: debouncedSearch,
        page: 1,
        limit: 20,
      })
  );

  const tutors = useMemo(() => {
    let filtered = tutorsData?.tutors || [];
    if (searchParams.minRating > 0) {
      filtered = filtered.filter(t => (t.rating || 0) >= searchParams.minRating);
    }
    return filtered;
  }, [tutorsData, searchParams.minRating]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: name === 'minRating' ? Number(value) : value }));
  };

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Perfect Tutor</h1>
          <p className="text-primary-100 mb-8">Search from thousands of verified tutors</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              type="text"
              placeholder="Name or subject..."
              name="search"
              value={searchParams.search}
              onChange={handleChange}
              className="bg-white text-gray-900"
            />
            <select
              name="subject"
              value={searchParams.subject}
              onChange={handleChange}
              className="px-4 py-2 rounded bg-white text-gray-900 border-0"
            >
              <option value="">All Subjects</option>
              {SUBJECTS.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <select
              name="city"
              value={searchParams.city}
              onChange={handleChange}
              className="px-4 py-2 rounded bg-white text-gray-900 border-0"
            >
              <option value="">All Cities</option>
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <select
              name="minRating"
              value={searchParams.minRating}
              onChange={handleChange}
              className="px-4 py-2 rounded bg-white text-gray-900 border-0"
            >
              <option value="0">All Ratings</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <Loading message="Finding tutors..." />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            Error loading tutors. Please try again.
          </div>
        ) : tutors && tutors.length > 0 ? (
          <>
            <p className="text-gray-600 mb-6">
              Found {tutors.length} tutor{tutors.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutors.map(tutor => (
                <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
                  <CardBody className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {tutor.firstName} {tutor.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{tutor.category || 'Tutor'}</p>
                      </div>
                      {tutor.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className={`font-semibold ${getRatingColor(tutor.rating)}`}>
                            {formatRating(tutor.rating)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-2 text-sm text-gray-600">
                      {tutor.city && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{tutor.city}</span>
                        </div>
                      )}
                      {tutor.subjects?.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Subjects:</span>
                          <span>{tutor.subjects.join(', ')}</span>
                        </div>
                      )}
                      {tutor.hourlyRate && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatCurrency(tutor.hourlyRate)}/hour</span>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {tutor.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2">{tutor.bio}</p>
                    )}

                    {/* Action Button */}
                    <Link to={`/tutor/${tutor.id}`}>
                      <Button className="w-full" variant="primary">
                        View Profile
                      </Button>
                    </Link>
                  </CardBody>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Search}
            title="No tutors found"
            description="Try adjusting your search criteria"
            action={
              <Button onClick={() => setSearchParams({ subject: '', city: '', search: '', minRating: 0 })}>
                Clear Filters
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
};

export default FindTutor;
