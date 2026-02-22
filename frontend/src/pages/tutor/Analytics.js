import React from 'react';
import { useQuery } from 'react-query';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { tutorService } from '../../services';
import { Card, CardBody, Loading, Badge } from '../../components/common';
import { TrendingUp, Users, Eye, Target } from 'lucide-react';

const Analytics = () => {
  const { data: analyticsData, isLoading } = useQuery(
    ['tutorAnalytics'],
    () => tutorService.getAnalytics({}),
    { select: (response) => response.data?.data || {} }
  );

  if (isLoading) return <Loading message="Loading analytics..." />;

  const stats = analyticsData?.stats || {};
  const chartData = analyticsData?.chartData || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Track your tutor performance and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Profile Views', value: stats.profileViews || 0, icon: Eye, color: 'blue' },
          { title: 'Total Leads', value: stats.totalLeads || 0, icon: Users, color: 'green' },
          { title: 'Conversion Rate', value: `${stats.conversionRate || 0}%`, icon: Target, color: 'purple' },
          { title: 'Response Rate', value: `${stats.responseRate || 0}%`, icon: TrendingUp, color: 'orange' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm text-gray-600">{stat.title}</h3>
                  <Icon className={`h-5 w-5 text-${stat.color}-500`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Views Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#4f46e5" />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Leads by Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="unlocked" fill="#4f46e5" />
                <Bar dataKey="converted" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Average Response Time</span>
              <span className="font-semibold">{stats.avgResponseTime || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Student Satisfaction</span>
              <span className="font-semibold">{stats.satisfaction || 'N/A'}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Active Sessions</span>
              <Badge type="success">{stats.activeSessions || 0}</Badge>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Analytics;
