import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Menu, X, User, LogOut } from 'lucide-react';

const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <GraduationCap className="h-8 w-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">TutorBazaar</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/find-tutor" className="text-gray-600 hover:text-gray-900 font-medium">
                Find Tutor
              </Link>
              <Link to="/enquiry" className="text-gray-600 hover:text-gray-900 font-medium">
                Post Requirement
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900 font-medium">
                Contact
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {user?.role === 'tutor' && (
                    <Link to="/tutor/dashboard" className="btn-primary">
                      Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-gray-600 hover:text-gray-900">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/find-tutor" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Find Tutor
              </Link>
              <Link to="/enquiry" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Post Requirement
              </Link>
              <Link to="/contact" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                Contact
              </Link>
              {!isAuthenticated && (
                <>
                  <Link to="/login" className="block px-3 py-2 text-gray-600 hover:text-gray-900">
                    Login
                  </Link>
                  <Link to="/register" className="block px-3 py-2 text-primary-600 font-medium">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-8 w-8 text-primary-400" />
                <span className="text-xl font-bold">TutorBazaar</span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting students with the best tutors across India.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Students</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/find-tutor" className="hover:text-white">Find a Tutor</Link></li>
                <li><Link to="/enquiry" className="hover:text-white">Post Requirement</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white">How it Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Tutors</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/register" className="hover:text-white">Join as Tutor</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/success-stories" className="hover:text-white">Success Stories</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2024 TutorBazaar. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
