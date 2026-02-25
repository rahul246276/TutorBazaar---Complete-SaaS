import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { adminService } from '../../services';
import { Button, Card, CardBody, Loading, EmptyState } from '../../components/common';
import { Users, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Tutors = () => {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(['adminTutors', search], () =>
    adminService.getTutors({ search, page: 1, limit: 20 })
  );

  const { mutate: approveTutor } = useMutation((id) => adminService.approveTutor(id), {
    onSuccess: () => {
      toast.success('Tutor approved');
      queryClient.invalidateQueries('adminTutors');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Approval failed'),
  });

  const { mutate: suspendTutor } = useMutation((id) => adminService.suspendTutor(id, 'Suspended by admin'), {
    onSuccess: () => {
      toast.success('Tutor suspended');
      queryClient.invalidateQueries('adminTutors');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Suspend failed'),
  });

  if (isLoading) return <Loading message="Loading tutors..." />;

  const tutors = data?.tutors || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tutors Management</h1>
        <p className="text-gray-600 mt-1">Review and manage tutor accounts.</p>
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
      </div>

      {tutors.length > 0 ? (
        <div className="space-y-4">
          {tutors.map((tutor) => (
            <Card key={tutor.id}>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {tutor.firstName} {tutor.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{tutor.email}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tutor.isApproved ? 'text-green-600' : 'text-yellow-600'}`}>
                      {tutor.isApproved ? 'approved' : 'pending'}
                    </p>
                    <p className="text-xs text-gray-600">{tutor.city}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!tutor.isApproved && (
                    <Button size="sm" onClick={() => approveTutor(tutor.id)}>
                      Approve
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => suspendTutor(tutor.id)}>
                    Suspend
                  </Button>
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
