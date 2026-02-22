import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, BookOpen, Star, Clock, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardBody, Button, Badge, EmptyState } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { tutorService } from '../../services';
import { useApi } from '../../hooks';
import { formatCurrency, getRatingColor } from '../../utils/formatters';

const TutorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock data for charts
  const viewsData = [
    { month: 'Jan', views: 400 },
    { month: 'Feb', views: 520 },
    { month: 'Mar', views: 680 },
    { month: 'Apr', views: 520 },
    { month: 'May', views: 780 },
    { month: 'Jun', views: 890 },
  ];

  const leadsData = [
    { status: 'Unlocked', count: 8 },
    { status: 'Available', count: 12 },
    { status: 'Expired', count: 3 },
  ];

  const stats = [
    {
      label: 'Profile Views',
      value: '1,245',
      change: '+12%',
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Total Leads',
      value: '23',
      change: '+5',
      icon: TrendingUp,
      color: 'green',
    },
    {
      label: 'Active Sessions',
      value: '4',
      change: '2 Today',
      icon: BookOpen,
      color: 'indigo',
    },
    {
      label: 'Rating',
      value: '4.8',
      change: 'Excellent',
      icon: Star,
      color: 'yellow',
    },
  ];

  const recentLeads = [
    {
      id: 1,
      studentName: 'Priya Sharma',
      subject: 'Mathematics',
      budget: '₹500/hr',
      time: '2 hours ago',
      status: 'new',
    },
    {
      id: 2,
      studentName: 'Raj Kumar',
      subject: 'Physics',
      budget: '₹600/hr',
      time: '5 hours ago',
      status: 'unlocked',
    },
    {
      id: 3,
      studentName: 'Sneha Verma',
      subject: 'English',
      budget: '₹400/hr',
      time: '1 day ago',
      status: 'new',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-1">Here's your tutoring overview</p>
        </div>
        <Button onClick={() => navigate('/tutor/leads')} className="bg-indigo-600 hover:bg-indigo-700">
          View All Leads
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardBody className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Profile Views Trend</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ fill: '#4f46e5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Leads Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Leads Status</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leadsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
        </CardHeader>
        <CardBody>
          {recentLeads.length === 0 ? (
            <EmptyState
              title="No leads yet"
              description="Check back soon for new lead opportunities"
              action={() => navigate('/tutor/leads')}
              buttonText="View All Leads"
            />
          ) : (
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">{lead.studentName}</h4>
                      <Badge>{lead.subject}</Badge>
                      <Badge color={lead.status === 'unlocked' ? 'success' : 'warning'}>
                        {lead.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{lead.budget}</p>
                    <p className="text-xs text-gray-500 mt-1">{lead.time}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary">
                      View
                    </Button>
                    <Button size="sm">Contact</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/tutor/profile')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition"
            >
              <h4 className="font-semibold text-gray-900">Update Profile</h4>
              <p className="text-sm text-gray-600 mt-1">Edit your subjects and qualifications</p>
            </button>
            <button
              onClick={() => navigate('/tutor/credits')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition"
            >
              <h4 className="font-semibold text-gray-900">Buy Credits</h4>
              <p className="text-sm text-gray-600 mt-1">Purchase more credits to unlock leads</p>
            </button>
            <button
              onClick={() => navigate('/tutor/analytics')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition"
            >
              <h4 className="font-semibold text-gray-900">View Analytics</h4>
              <p className="text-sm text-gray-600 mt-1">Check your performance metrics</p>
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default TutorDashboard;
