import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CreditCard, Zap, Crown, Building2, Check, History } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const creditPackages = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 50,
    price: 500,
    originalPrice: 500,
    discount: 0,
    icon: CreditCard,
    color: 'blue',
    features: ['50 Credits', '₹10 per credit', 'Valid for 1 year'],
  },
  {
    id: 'popular',
    name: 'Popular',
    credits: 120,
    price: 1000,
    originalPrice: 1200,
    discount: 17,
    icon: Zap,
    color: 'purple',
    popular: true,
    features: ['120 Credits', '₹8.33 per credit', 'Save ₹200', 'Valid for 1 year'],
  },
  {
    id: 'premium',
    name: 'Premium',
    credits: 300,
    price: 2000,
    originalPrice: 3000,
    discount: 33,
    icon: Crown,
    color: 'amber',
    features: ['300 Credits', '₹6.67 per credit', 'Save ₹1000', 'Valid for 1 year'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 1000,
    price: 5000,
    originalPrice: 10000,
    discount: 50,
    icon: Building2,
    color: 'emerald',
    features: ['1000 Credits', '₹5 per credit', 'Save ₹5000', 'Priority support'],
  },
];

const Credits = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('purchase');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: transactionHistory, isLoading: historyLoading } = useQuery(
    'creditHistory',
    () => axios.get('/api/tutors/credits').then(res => res.data.data),
    { enabled: activeTab === 'history' }
  );

  const purchaseMutation = useMutation(
    (packageId) => axios.post('/api/tutors/credits/purchase', { package: packageId }),
    {
      onSuccess: (response) => {
        const { orderId, amount, key } = response.data.data;

        // Initialize Razorpay
        const options = {
          key: key,
          amount: amount * 100,
          currency: 'INR',
          name: 'TutorBazaar',
          description: 'Credit Purchase',
          order_id: orderId,
          handler: async (response) => {
            try {
              const verifyRes = await axios.post('/api/tutors/credits/verify', {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.data.success) {
                toast.success('Payment successful! Credits added.');
                updateUser({ credits: { ...user.credits, balance: verifyRes.data.data.newBalance }});
              }
            } catch (error) {
              toast.error('Payment verification failed');
            }
            setIsProcessing(false);
          },
          prefill: {
            email: user?.email,
            contact: user?.phone,
          },
          theme: {
            color: '#4F46E5',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();

        rzp.on('payment.failed', () => {
          toast.error('Payment failed');
          setIsProcessing(false);
        });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create order');
        setIsProcessing(false);
      },
    }
  );

  const handlePurchase = (packageId) => {
    setIsProcessing(true);
    purchaseMutation.mutate(packageId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Credits</h1>
        <p className="text-gray-600 mt-1">Purchase credits to unlock student leads</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm font-medium">Current Balance</p>
            <p className="text-5xl font-bold mt-2">{user?.credits?.balance || 0}</p>
            <p className="text-primary-100 text-sm mt-1">credits available</p>
          </div>
          <div className="text-right">
            <p className="text-primary-100 text-sm">Total Purchased</p>
            <p className="text-2xl font-semibold">{user?.credits?.totalPurchased || 0}</p>
            <p className="text-primary-100 text-sm mt-2">Total Spent</p>
            <p className="text-2xl font-semibold">{user?.credits?.totalSpent || 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('purchase')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'purchase'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Purchase Credits
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Transaction History
          </button>
        </nav>
      </div>

      {/* Purchase Tab */}
      {activeTab === 'purchase' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`card relative overflow-hidden ${pkg.popular ? 'ring-2 ring-primary-500' : ''}`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  POPULAR
                </div>
              )}
              <div className="p-6">
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-lg bg-${pkg.color}-100 text-${pkg.color}-600 mb-4`}>
                  <pkg.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">₹{pkg.price}</span>
                  {pkg.discount > 0 && (
                    <span className="ml-2 text-sm text-gray-500 line-through">₹{pkg.originalPrice}</span>
                  )}
                </div>
                <p className="text-2xl font-bold text-primary-600 mt-2">{pkg.credits} Credits</p>
                {pkg.discount > 0 && (
                  <p className="text-sm text-green-600 font-medium">Save {pkg.discount}%</p>
                )}
                <ul className="mt-4 space-y-2">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={isProcessing}
                  className={`w-full mt-6 py-2 px-4 rounded-lg font-medium transition-colors ${
                    pkg.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {isProcessing ? 'Processing...' : 'Purchase'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <History className="h-5 w-5 mr-2" />
              Transaction History
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {historyLoading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : transactionHistory?.history?.transactions?.length > 0 ? (
              transactionHistory.history.transactions.map((txn) => (
                <div key={txn._id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{txn.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(txn.createdAt).toLocaleDateString()} • {txn.transactionId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      txn.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {txn.amount > 0 ? '+' : ''}{txn.amount} credits
                    </p>
                    <p className="text-sm text-gray-500">Balance: {txn.balanceAfter}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No transactions yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Load Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
};

export default Credits;
