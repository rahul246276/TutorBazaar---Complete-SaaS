import React from 'react';
import { useQuery } from 'react-query';
import { Users, TrendingUp, DollarSign, BookOpen } from 'lucide-react';
import { adminService } from '../../services';
import { Card, CardBody, Loading } from '../../components/common';

const Dashboard = () => {
  const { data: dashboardData, isLoading } = useQuery(
    ['adminDashboard'],
    () => adminService.getDashboard(),
    { select: (response) => response.data?.data || {} }
  );

  if (isLoading) return <Loading message="Loading dashboard..." />;

  const stats = dashboardData?.stats || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage platform, tutors, students, and payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Tutors', value: stats.totalTutors || 0, icon: Users, color: 'blue' },
          { title: 'Total Students', value: stats.totalStudents || 0, icon: BookOpen, color: 'green' },
          { title: 'Total Revenue', value: `₹${stats.totalRevenue || 0}`, icon: DollarSign, color: 'purple' },
          { title: 'Active Leads', value: stats.activeLeads || 0, icon: TrendingUp, color: 'orange' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm text-gray-600">{stat.title}</h3>
                  <Icon className={`h-5 w-5 text-${stat.color}-500`} />
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
            <div className="space-y-2">
              {dashboardData?.recentTransactions?.slice(0, 5).map((transaction, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-xs text-gray-600">{transaction.date}</p>
                  </div>
                  <span className="font-semibold">₹{transaction.amount}</span>
                </div>
              )) || <p className="text-gray-600">No transactions</p>}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
            <div className="space-y-3">
              {[
                { label: 'Database', status: 'healthy' },
                { label: 'API Server', status: 'healthy' },
                { label: 'Email Service', status: 'healthy' },
                { label: 'Payment Gateway', status: 'healthy' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
