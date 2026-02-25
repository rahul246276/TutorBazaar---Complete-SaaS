import React from 'react';
import { useQuery, useMutation } from 'react-query';
import { CreditCard, History, Plus } from 'lucide-react';
import { tutorService } from '../../services';
import { Button, Card, CardBody, Loading } from '../../components/common';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

const Credits = () => {
  const { data: creditsData, isLoading } = useQuery(['tutorCredits'], () => tutorService.getCredits({ page: 1, limit: 20 }));

  const { mutate: purchaseCredits, isLoading: isPurchasing } = useMutation(
    (packageName) => tutorService.purchaseCredits(packageName),
    {
      onSuccess: (data) => {
        const order = data?.data?.data || data?.data;
        toast.success(`Order created: ${order?.orderId || 'success'}. Complete payment in Razorpay checkout.`);
      },
      onError: (error) => toast.error(error.response?.data?.message || 'Failed to create order'),
    }
  );

  if (isLoading) return <Loading message="Loading credits..." />;

  const balance = creditsData?.balance?.balance || 0;
  const transactions = creditsData?.history?.transactions || [];

  const packages = [
    { name: 'starter', credits: 50, price: 500 },
    { name: 'popular', credits: 120, price: 1000, popular: true },
    { name: 'premium', credits: 300, price: 2000 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Credits</h1>
        <p className="text-gray-600 mt-1">Manage your credits for unlocking student leads.</p>
      </div>

      <Card className="bg-gradient-to-br from-primary-50 to-primary-100">
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Available Credits</p>
              <p className="text-5xl font-bold text-primary-600 mt-2">{balance}</p>
            </div>
            <CreditCard className="h-16 w-16 text-primary-200" />
          </div>
        </CardBody>
      </Card>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Credit Packages</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <Card key={pkg.name} className={pkg.popular ? 'ring-2 ring-primary-600 scale-105' : ''}>
              <CardBody className="text-center space-y-4">
                {pkg.popular && (
                  <div className="text-xs font-semibold bg-primary-100 text-primary-700 px-3 py-1 rounded-full inline-block">
                    Popular
                  </div>
                )}
                <div>
                  <p className="text-3xl font-bold text-primary-600">{pkg.credits}</p>
                  <p className="text-sm text-gray-600">Credits</p>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(pkg.price)}</p>
                <Button
                  variant={pkg.popular ? 'primary' : 'secondary'}
                  className="w-full"
                  isLoading={isPurchasing}
                  onClick={() => purchaseCredits(pkg.name)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Buy
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <History className="mr-2 h-6 w-6" />
          Transaction History
        </h2>
        {transactions.length > 0 ? (
          <Card>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map((t) => (
                  <tr key={t._id || t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm">{formatDate(t.createdAt)}</td>
                    <td className="px-6 py-3 text-sm">{t.description}</td>
                    <td className="px-6 py-3 text-sm text-right font-medium">{t.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : (
          <Card>
            <CardBody className="text-center py-12 text-gray-600">No transactions yet</CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Credits;
