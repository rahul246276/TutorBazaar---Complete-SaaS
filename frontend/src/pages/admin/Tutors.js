import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { adminService } from '../../services';
import { Button, Card, CardBody, Loading, EmptyState } from '../../components/common';
import { Users, Search, Filter } from 'lucide-react';

const Tutors = () => {
  const [search, setSearch] = useState('');
  const { data: tutorsData, isLoading } = useQuery(
    ['adminTutors', search],
    () => adminService.getTutors({ search, page: 1, limit: 20 }),
    { select: (response) => response.data?.data?.tutors || [] }
  );

  if (isLoading) return <Loading message="Loading tutors..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tutors Management</h1>
        <p className="text-gray-600 mt-1">Manage and verify tutor accounts</p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 flex items-center bg-white border rounded-lg px-4">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tutors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 py-2 ml-2 outline-none"
          />
        </div>
        <Button variant="secondary"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
      </div>

      {tutorsData && tutorsData.length > 0 ? (
        <div className="space-y-4">
          {tutorsData.map(tutor => (
            <Card key={tutor.id}>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{tutor.firstName} {tutor.lastName}</h3>
                    <p className="text-sm text-gray-600">{tutor.email}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tutor.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {tutor.status}
                    </p>
                    <p className="text-xs text-gray-600">{tutor.city}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">View Profile</Button>
                  <Button variant="secondary" size="sm">Verify</Button>
                  <Button variant="secondary" size="sm">Deactivate</Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={Users} title="No tutors found" />
      )}
    </div>
  );
};

export default Tutors;
