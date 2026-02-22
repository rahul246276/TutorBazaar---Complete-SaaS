import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Input, Button, Card, CardBody } from '../../components/common';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Simulate sending contact email
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Thank you! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-16 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
        <p className="text-xl text-gray-600">
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <Card>
            <CardBody className="text-center space-y-3">
              <div className="flex justify-center">
                <Mail className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold">Email</h3>
              <p className="text-gray-600">
                <a href="mailto:support@tutorbazaar.com" className="hover:text-primary-600">
                  support@tutorbazaar.com
                </a>
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center space-y-3">
              <div className="flex justify-center">
                <Phone className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold">Phone</h3>
              <p className="text-gray-600">
                <a href="tel:+919876543210" className="hover:text-primary-600">
                  +91 98765 43210
                </a>
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="text-center space-y-3">
              <div className="flex justify-center">
                <Clock className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold">Response Time</h3>
              <p className="text-gray-600">Usually responds within 24 hours</p>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardBody>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                />

                <Input
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Your message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full"
                >
                  Send Message
                </Button>
              </form>
            </CardBody>
          </Card>

          {/* FAQ / Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <Card>
                  <CardBody>
                    <h3 className="font-semibold text-gray-900 mb-2">What are your business hours?</h3>
                    <p className="text-gray-600 text-sm">
                      We operate Monday to Friday, 9 AM - 6 PM IST. Support emails are answered within 24 hours.
                    </p>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <h3 className="font-semibold text-gray-900 mb-2">How long does it take to find a tutor?</h3>
                    <p className="text-gray-600 text-sm">
                      Typically, we match you with a tutor within 2-3 days of posting your requirement.
                    </p>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                    <p className="text-gray-600 text-sm">
                      We accept all major credit/debit cards, UPI, and net banking for secure transactions.
                    </p>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <h3 className="font-semibold text-gray-900 mb-2">Can I cancel my subscription?</h3>
                    <p className="text-gray-600 text-sm">
                      Yes, you can cancel anytime with no hidden charges or penalties.
                    </p>
                  </CardBody>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
