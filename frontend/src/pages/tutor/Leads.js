import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, MapPin, BookOpen, Clock, Phone, Mail, User, Lock, Unlock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Leads = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('available');

  const { data: availableLeads, isLoading: availableLoading, refetch: refetchAvailable } = useQuery(
    'availableLeads',
    () => axios.get('/api/tutors/leads/available').then(res => res.data.data),
    { enabled: activeTab === 'available' }
  );

  const { data: myLeads, isLoading: myLeadsLoading, refetch: refetchMyLeads } = useQuery(
    'myLeads',
    () => axios.get('/api/tutors/leads/my').then(res => res.data.data),
    { enabled: activeTab === 'my' }
  );

  const unlockMutation = useMutation(
    (leadId) => axios.post(`/api/tutors/leads/${leadId}/unlock`),
    {
      onSuccess: (response) => {
        toast.success('Lead unlocked successfully!');
        updateUser({ credits: { ...user.credits, balance: response.data.data.remainingCredits }});
        refetchAvailable();
        refetchMyLeads();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to unlock lead');
      },
    }
  );

  const handleUnlock = (leadId) => {
    if (window.confirm(`Unlock this lead for ${availableLeads?.creditsRequired || 10} credits?`)) {
      unlockMutation.mutate(leadId);
    }
  };

  const renderLeadCard = (lead, isAvailable = false) => (
    <div key={lead._id} className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {lead.requirements.subjects.join(', ')}
            </h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              lead.status === 'active' ? 'bg-green-100 text-green-800' :
              lead.status === 'locked' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {lead.status === 'active' ? 'Available' : 
               lead.status === 'locked' ? 'Locked' : 'Converted'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-3">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
              Class {lead.requirements.class}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              {lead.requirements.city}
              {lead.requirements.locality && `, ${lead.requirements.locality}`}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              {lead.requirements.mode === 'online' ? 'Online' : 
               lead.requirements.mode === 'offline' ? 'Offline' : 'Online/Offline'}
            </div>
            <div className="flex items-center">
              <span className="font-medium text-gray-900">Budget:</span>
              <span className="ml-1">
                ₹{lead.requirements.budget?.min || 0} - ₹{lead.requirements.budget?.max || 'N/A'}/month
              </span>
            </div>
          </div>

          {lead.requirements.goals && (
            <p className="mt-3 text-sm text-gray-600">
              <span className="font-medium">Goals:</span> {lead.requirements.goals}
            </p>
          )}

          {/* Contact Info (Only for unlocked leads) */}
          {lead.status !== 'active' && lead.student && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Contact Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-green-800">
                  <User className="h-4 w-4 mr-2" />
                  {lead.student.name}
                </div>
                <div className="flex items-center text-green-800">
                  <Phone className="h-4 w-4 mr-2" />
                  <a href={`tel:${lead.student.phone}`} className="hover:underline">
                    {lead.student.phone}
                  </a>
                </div>
                <div className="flex items-center text-green-800">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href={`mailto:${lead.student.email}`} className="hover:underline">
                    {lead.student.email}
                  </a>
                </div>
              </div>
              {lead.lockInfo?.expiresAt && (
                <p className="mt-3 text-xs text-green-700">
                  <Clock className="inline h-3 w-3 mr-1" />
                  Lock expires: {new Date(lead.lockInfo.expiresAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        {isAvailable && lead.status === 'active' && (
          <button
            onClick={() => handleUnlock(lead._id)}
            disabled={unlockMutation.isLoading}
            className="ml-4 flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <Lock className="h-4 w-4 mr-2" />
            Unlock ({availableLeads?.creditsRequired || 10} credits)
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
          <p className="text-gray-600 mt-1">
            Available Credits: <span className="font-semibold text-primary-600">{user?.credits?.balance || 0}</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'available'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Available Leads
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Unlocked Leads
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'available' && (
          <>
            {availableLoading ? (
              <div className="text-center py-12 text-gray-500">Loading available leads...</div>
            ) : availableLeads?.leads?.length > 0 ? (
              availableLeads.leads.map(lead => renderLeadCard(lead, true))
            ) : (
              <div className="text-center py-12 card">
                <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No leads available</h3>
                <p className="text-gray-500 mt-1">Check back later for new leads in your area</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'my' && (
          <>
            {myLeadsLoading ? (
              <div className="text-center py-12 text-gray-500">Loading your leads...</div>
            ) : myLeads?.leads?.length > 0 ? (
              myLeads.leads.map(lead => renderLeadCard(lead, false))
            ) : (
              <div className="text-center py-12 card">
                <Unlock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No leads unlocked yet</h3>
                <p className="text-gray-500 mt-1">Browse available leads and unlock them to see contact details</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Leads;
