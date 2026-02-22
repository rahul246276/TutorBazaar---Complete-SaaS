import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Users, 
  TrendingUp, 
  Star,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TutorDashboard = () => {
  const { user } = useAuth();

  const { data: dashboardData, isLoading } = useQuery('tutorDashboard', 
    () => axios.get('/api/tutors/dashboard').then(res => res.data.data),
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const stats = dashboardData?.stats;
  const recentLeads = dashboardData?.recentLeads || [];

  const statCards = [
    { 
      title: 'Credit Balance', 
      value: stats?.credits?.balance || 0, 
      icon: CreditCard, 
      color: 'bg-blue-500',
      link: '/tutor/credits'
    },
    { 
      title: 'Leads Unlocked', 
      value: stats?.metrics?.unlockedLeads || 0, 
      icon: Users, 
      color: 'bg-green-500',
      link: '/tutor/leads'
    },
    { 
      title: 'Conversion Rate', 
      value: `${stats?.metrics?.conversionRate || 0}%`, 
      icon: TrendingUp, 
      color: 'bg-purple-500',
      link: '/tutor/analytics'
    },
    { 
      title: 'Profile Completion', 
      value: `${stats?.profileCompletion || 0}%`, 
      icon: CheckCircle, 
      color: 'bg-orange-500',
      link: '/tutor/profile'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-primary-100">
              You have {stats?.credits?.balance || 0} credits available. Start unlocking leads to grow your business.
            </p>
          </div>
          <Link 
            to="/tutor/leads" 
            className="hidden sm:inline-flex items-center px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Browse Leads
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link 
            key={index} 
            to={stat.link}
            className="card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Leads */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
              <Link to="/tutor/leads" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {recentLeads.length > 0 ? (
                recentLeads.map((lead) => (
                  <div key={lead._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">
                            {lead.requirements.subjects.join(', ')}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            lead.status === 'locked' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {lead.status === 'locked' ? 'Active' : 'Converted'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {lead.requirements.class} • {lead.requirements.city}
                        </p>
                        <p className="text-sm text-gray-500">
                          Budget: ₹{lead.requirements.budget?.min || 0} - ₹{lead.requirements.budget?.max || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          <Clock className="inline h-4 w-4 mr-1" />
                          {new Date(lead.lockInfo?.lockedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No leads unlocked yet</p>
                  <Link to="/tutor/leads" className="text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block">
                    Browse Available Leads
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                to="/tutor/leads" 
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <Users className="h-5 w-5 text-primary-600 mr-3" />
                <span className="font-medium text-gray-900">Find New Leads</span>
              </Link>
              <Link 
                to="/tutor/credits" 
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <CreditCard className="h-5 w-5 text-primary-600 mr-3" />
                <span className="font-medium text-gray-900">Buy Credits</span>
              </Link>
              <Link 
                to="/tutor/profile" 
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <Star className="h-5 w-5 text-primary-600 mr-3" />
                <span className="font-medium text-gray-900">Complete Profile</span>
              </Link>
            </div>
          </div>

          {/* Subscription Status */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Current Plan</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-primary-600 capitalize">
                {stats?.subscription?.plan || 'Free'}
              </span>
              {stats?.subscription?.plan !== 'free' && (
                <span className="text-sm text-gray-500">
                  Expires: {new Date(stats?.subscription?.endDate).toLocaleDateString()}
                </span>
              )}
            </div>
            <Link 
              to="/tutor/credits" 
              className="w-full btn-primary text-center block"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
