import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { MapPin, BookOpen, Clock, Phone, Mail, Unlock, DollarSign } from 'lucide-react';
import { tutorService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, CardBody, Loading, EmptyState, Badge } from '../../components/common';
import { usePagination } from '../../hooks';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dateUtils';

const Leads = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('available');
  const { page, pageSize } = usePagination();

  const { data: leadsData, isLoading } = useQuery(['tutorLeads', activeTab, page], () =>
    tutorService.getLeads({ page, limit: pageSize, type: activeTab })
  );

  const { mutate: unlockLead, isLoading: isUnlocking } = useMutation((leadId) => tutorService.unlockLead(leadId), {
    onSuccess: () => {
      toast.success('Lead unlocked');
      queryClient.invalidateQueries('tutorLeads');
      queryClient.invalidateQueries('tutorDashboard');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to unlock lead'),
  });

  if (isLoading) return <Loading message="Loading leads..." />;

  const leads = leadsData?.leads || [];
  const creditsBalance = user?.credits?.balance || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">Find and respond to student requirements</p>
        </div>
        <Card className="bg-primary-50 border-primary-200">
          <CardBody className="flex items-center space-x-3">
            <DollarSign className="h-6 w-6 text-primary-600" />
            <div>
              <p className="text-sm text-gray-600">Credits</p>
              <p className="text-2xl font-bold text-primary-600">{creditsBalance}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex space-x-4 border-b border-gray-200">
        {['available', 'unlocked'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 font-medium border-b-2 transition-colors ${
              activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600'
            }`}
          >
            {tab === 'available' ? 'Available' : 'Unlocked'} Leads
          </button>
        ))}
      </div>

      {leads.length > 0 ? (
        <div className="space-y-4">
          {leads.map((lead) => (
            <Card key={lead.id}>
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold">{lead.title}</h3>
                      <Badge type={lead.status === 'active' ? 'success' : 'primary'}>{lead.status}</Badge>
                    </div>
                    <p className="text-gray-600 mt-2">{lead.description}</p>
                  </div>
                  {lead.budget > 0 && <p className="text-2xl font-bold text-primary-600">Rs {lead.budget}/hr</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  {lead.subject && (
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{lead.subject}</span>
                    </div>
                  )}
                  {lead.grade && <div>{lead.grade}</div>}
                  {lead.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{lead.location}</span>
                    </div>
                  )}
                  {lead.createdAt && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(lead.createdAt)}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  {activeTab === 'available' && (
                    <>
                      <Button
                        className="flex-1"
                        isLoading={isUnlocking}
                        onClick={() => unlockLead(lead.id)}
                        disabled={creditsBalance < 1}
                      >
                        <Unlock className="mr-2 h-4 w-4" />
                        Unlock
                      </Button>
                      <Button variant="secondary" className="flex-1">
                        View
                      </Button>
                    </>
                  )}
                  {activeTab === 'unlocked' && (
                    <>
                      <Button className="flex-1">
                        <Mail className="mr-2 h-4 w-4" />
                        Send Response
                      </Button>
                      <Button variant="secondary" className="flex-1">
                        <Phone className="mr-2 h-4 w-4" />
                        Contact
                      </Button>
                    </>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={BookOpen} title="No leads" description="Check back soon." />
      )}
    </div>
  );
};

export default Leads;
