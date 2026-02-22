import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Award, Shield, ArrowRight, Star } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Search,
      title: 'Find Expert Tutors',
      description: 'Browse through thousands of verified tutors across all subjects and cities.',
    },
    {
      icon: Shield,
      title: 'Verified Profiles',
      description: 'Every tutor is thoroughly vetted and background checked for your safety.',
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: 'We monitor tutor performance to ensure you get the best learning experience.',
    },
  ];

  const popularSubjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'English', 'Hindi', 'Computer Science', 'History'
  ];

  const stats = [
    { value: '10,000+', label: 'Active Tutors' },
    { value: '50,000+', label: 'Students Helped' },
    { value: '100+', label: 'Cities Covered' },
    { value: '4.8/5', label: 'Average Rating' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] opacity-10 bg-cover bg-center" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find the Perfect Tutor for Your Learning Journey
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Connect with expert tutors in your city. Personalized learning that fits your schedule and budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/find-tutor" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-white text-primary-600 hover:bg-gray-100 transition-colors">
                <Search className="mr-2 h-5 w-5" />
                Find a Tutor
              </Link>
              <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg border-2 border-white text-white hover:bg-white hover:text-primary-600 transition-colors">
                <Users className="mr-2 h-5 w-5" />
                Become a Tutor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary-600">{stat.value}</p>
                <p className="text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose TutorBazaar?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make finding the right tutor simple, safe, and effective.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-8 text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mb-6">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Subjects */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Popular Subjects</h2>
            <p className="text-xl text-gray-600">Find tutors for any subject you need</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularSubjects.map((subject, index) => (
              <Link
                key={index}
                to={`/find-tutor?subject=${subject}`}
                className="card p-6 text-center hover:border-primary-500 hover:shadow-md transition-all group"
              >
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">{subject}</h3>
                <p className="text-sm text-gray-500 mt-1">Find Tutors →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Post Your Requirement', desc: 'Tell us what you need - subject, class, budget, and location.' },
              { step: '2', title: 'Get Matched', desc: 'Our system matches you with the best tutors in your area.' },
              { step: '3', title: 'Start Learning', desc: 'Connect with your tutor and begin your learning journey.' },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="card p-8 relative z-10">
                  <div className="h-12 w-12 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-primary-200 -translate-y-1/2 z-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Find Your Perfect Tutor?</h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of students who have found their ideal tutor through TutorBazaar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/enquiry" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg bg-white text-primary-600 hover:bg-gray-100 transition-colors">
              Post Requirement Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
