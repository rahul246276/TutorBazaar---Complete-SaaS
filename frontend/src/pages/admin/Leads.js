import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { adminService } from '../../services';
import { Card, CardBody, Loading, EmptyState } from '../../components/common';
import { BookOpen } from 'lucide-react';

const Leads = () => {
  const [status, setStatus] = useState('all');
  const { data: leadsData, isLoading } = useQuery(
    ['adminLeads', status],
    () => adminService.getLeads({ status: status === 'all' ? '' : status, page: 1, limit: 20 })
  );

  if (isLoading) return <Loading message="Loading leads..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
        <p className="text-gray-600 mt-1">Monitor all student leads</p>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'active', 'locked', 'converted', 'expired'].map(st => (
          <button
            key={st}
            onClick={() => setStatus(st)}
            className={`px-4 py-2 rounded-lg border transition ${
              status === st
                ? 'border-primary-600 bg-primary-50 text-primary-600'
                : 'border-gray-300 text-gray-600'
            }`}
          >
            {st.charAt(0).toUpperCase() + st.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {leadsData?.leads?.length > 0 ? (
        <div className="space-y-4">
          {leadsData.leads.map(lead => (
            <Card key={lead.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{lead.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{lead.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    lead.status === 'active' ? 'bg-green-100 text-green-800' :
                    lead.status === 'locked' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={BookOpen} title="No leads found" />
      )}
    </div>
  );
};

export default Leads;
