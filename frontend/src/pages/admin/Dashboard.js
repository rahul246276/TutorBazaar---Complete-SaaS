import React from 'react';
import { useQuery } from 'react-query';
import { Users, TrendingUp, DollarSign, BookOpen } from 'lucide-react';
import { adminService } from '../../services';
import { Card, CardBody, Loading } from '../../components/common';

const Dashboard = () => {
  const { data: dashboardData, isLoading } = useQuery(['adminDashboard'], () => adminService.getDashboard());

  if (isLoading) return <Loading message="Loading dashboard..." />;

  const stats = dashboardData?.stats || {};
  const cards = [
    { title: 'Total Tutors', value: stats?.tutors?.total || 0, icon: Users },
    { title: 'Total Students', value: stats?.students || 0, icon: BookOpen },
    { title: 'Total Revenue', value: `Rs ${stats?.revenue?.total || 0}`, icon: DollarSign },
    { title: 'Total Leads', value: stats?.leads?.total || 0, icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage tutors, leads, and payments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm text-gray-600">{stat.title}</h3>
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h2>
            <div className="space-y-2">
              {(dashboardData?.recentActivity?.payments || []).slice(0, 5).map((payment) => (
                <div key={payment._id} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">
                      {payment.user?.firstName || 'User'} {payment.user?.lastName || ''}
                    </p>
                    <p className="text-xs text-gray-600">{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="font-semibold">Rs {payment.amount}</span>
                </div>
              ))}
              {!dashboardData?.recentActivity?.payments?.length && <p className="text-gray-600">No payments</p>}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Leads</h2>
            <div className="space-y-2">
              {(dashboardData?.recentActivity?.leads || []).slice(0, 5).map((lead) => (
                <div key={lead._id} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">{(lead.requirements?.subjects || []).join(', ') || 'Lead'}</p>
                    <p className="text-xs text-gray-600">{lead.requirements?.city || '-'}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100">{lead.status}</span>
                </div>
              ))}
              {!dashboardData?.recentActivity?.leads?.length && <p className="text-gray-600">No leads</p>}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
