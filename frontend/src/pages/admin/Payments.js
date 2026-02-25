import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { adminService } from '../../services';
import { Card, CardBody, Loading, EmptyState } from '../../components/common';
import { DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';

const Payments = () => {
  const [status, setStatus] = useState('all');
  const { data: paymentsData, isLoading } = useQuery(
    ['adminPayments', status],
    () => adminService.getPayments({ status: status === 'all' ? '' : status, page: 1, limit: 20 })
  );

  if (isLoading) return <Loading message="Loading payments..." />;

  const payments = paymentsData?.payments || [];
  const totalRevenue = paymentsData?.totalRevenue || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Track all platform transactions</p>
        </div>
        <Card className="bg-primary-50 border-primary-200">
          <CardBody className="flex items-center space-x-3">
            <TrendingUp className="h-6 w-6 text-primary-600" />
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-primary-600">{formatCurrency(totalRevenue)}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'paid', 'created', 'failed', 'refunded'].map(st => (
          <button
            key={st}
            onClick={() => setStatus(st)}
            className={`px-4 py-2 rounded-lg border transition ${
              status === st
                ? 'border-primary-600 bg-primary-50 text-primary-600'
                : 'border-gray-300 text-gray-600'
            }`}
          >
            {st.charAt(0).toUpperCase() + st.slice(1)}
          </button>
        ))}
      </div>

      {payments && payments.length > 0 ? (
        <Card>
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-mono">{payment.orderId}</td>
                  <td className="px-6 py-3 text-sm">{payment.userName}</td>
                  <td className="px-6 py-3 text-sm font-semibold">{formatCurrency(payment.amount)}</td>
                  <td className="px-6 py-3 text-sm">{formatDate(payment.createdAt)}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                      payment.status === 'created' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState icon={DollarSign} title="No payments found" />
      )}
    </div>
  );
};

export default Payments;
