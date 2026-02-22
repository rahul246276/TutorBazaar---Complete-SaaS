import React from 'react';
import { useQuery } from 'react-query';
import { CreditCard, TrendingUp, History, Plus } from 'lucide-react';
import { tutorService } from '../../services';
import { Button, Card, CardBody, Loading } from '../../components/common';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';

const Credits = () => {
  const { data: creditsData, isLoading } = useQuery(
    ['tutorCredits'],
    () => tutorService.getCredits(),
    { select: (response) => response.data?.data || {} }
  );

  const { data: transactionsData } = useQuery(
    ['creditTransactions'],
    () => tutorService.getCreditTransactions({ page: 1, limit: 10 }),
    { select: (response) => response.data?.data || { transactions: [] } }
  );

  if (isLoading) return <Loading message="Loading credits..." />;

  const balance = creditsData?.balance || 0;
  const transactions = transactionsData?.transactions || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Credits</h1>
        <p className="text-gray-600 mt-1">Manage your credits for unlocking student leads</p>
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
          <Button className="bg-primary-600 hover:bg-primary-700">
            <Plus className="mr-2 h-4 w-4" /> Buy Credits
          </Button>
        </CardBody>
      </Card>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Credit Packages</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { credits: 5, price: 299 },
            { credits: 10, price: 499, popular: true },
            { credits: 25, price: 999 },
          ].map(pkg => (
            <Card key={pkg.credits} className={pkg.popular ? 'ring-2 ring-primary-600 scale-105' : ''}>
              <CardBody className="text-center space-y-4">
                {pkg.popular && <div className="text-xs font-semibold bg-primary-100 text-primary-700 px-3 py-1 rounded-full inline-block">Popular</div>}
                <div>
                  <p className="text-3xl font-bold text-primary-600">{pkg.credits}</p>
                  <p className="text-sm text-gray-600">Credits</p>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(pkg.price)}</p>
                <Button variant={pkg.popular ? 'primary' : 'secondary'} className="w-full">Buy</Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center"><History className="mr-2 h-6 w-6" /> Transaction History</h2>
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
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm">{formatDate(t.createdAt)}</td>
                    <td className="px-6 py-3 text-sm">{t.description}</td>
                    <td className="px-6 py-3 text-sm text-right font-medium">{t.type === 'purchase' ? '+' : '-'}{t.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : (
          <Card><CardBody className="text-center py-12 text-gray-600">No transactions yet</CardBody></Card>
        )}
      </div>
    </div>
  );
};

export default Credits;
