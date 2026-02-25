import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Users, TrendingUp, CreditCard, CheckCircle } from 'lucide-react';
import { Card, CardBody, CardHeader, Button, Loading, EmptyState, Badge } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { tutorService } from '../../services';
import { formatCurrency } from '../../utils/formatters';
import { formatRelativeTime } from '../../utils/dateUtils';

const TutorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading } = useQuery(['tutorDashboard'], () => tutorService.getDashboard());

  if (isLoading) return <Loading message="Loading dashboard..." />;

  const stats = data?.stats || {};
  const metrics = stats?.metrics || {};
  const recentLeads = data?.recentLeads || [];

  const cards = [
    { label: 'Credits', value: stats?.credits?.balance || 0, icon: CreditCard },
    { label: 'Unlocked Leads', value: metrics.unlockedLeads || 0, icon: Users },
    { label: 'Converted Leads', value: metrics.convertedLeads || 0, icon: CheckCircle },
    { label: 'Response Rate', value: `${metrics.responseRate || 0}%`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'Tutor'}
          </h1>
          <p className="text-gray-600 mt-1">
            Subscription: {stats?.subscription?.plan || 'free'}
          </p>
        </div>
        <Button onClick={() => navigate('/tutor/leads')}>View All Leads</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardBody className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary-100">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
        </CardHeader>
        <CardBody>
          {recentLeads.length === 0 ? (
            <EmptyState title="No leads yet" description="Unlock leads to view them here." />
          ) : (
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div key={lead._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {(lead.requirements?.subjects || []).join(', ')}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {lead.requirements?.class} | {lead.requirements?.city}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatRelativeTime(lead.lockInfo?.lockedAt || lead.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge type={lead.status === 'converted' ? 'success' : 'primary'}>{lead.status}</Badge>
                    <p className="text-sm text-gray-700 mt-2">
                      {formatCurrency(lead.requirements?.budget?.max || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default TutorDashboard;
