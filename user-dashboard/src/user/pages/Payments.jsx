import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CreditCard, Loader2, Receipt } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { razorpayPaymentsAPI } from '../../services/api';
import { showError } from '../../utils/toastService';
import PaymentButton from '../components/PaymentButton';

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString();
};

const Payments = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [amount, setAmount] = useState(100);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const userId = user?.id || user?._id;

  const fetchPayments = async () => {
    if (!userId) return;

    try {
      setPaymentsLoading(true);
      const response = await razorpayPaymentsAPI.getUserPayments(userId);
      setPayments(response.data?.data?.payments || []);
    } catch (error) {
      showError(error?.response?.data?.message || 'Unable to load payments');
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [userId]);

  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef7ff_48%,#ffffff_100%)] text-[var(--color-secondary)]">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,_rgba(186,230,253,0.55),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_28%)]" />

      <main className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="reveal-up rounded-[32px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_70px_rgba(17,31,26,0.08)] backdrop-blur-xl sm:p-7">
          <p className="section-kicker">Test mode</p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-secondary)] sm:text-4xl">
                Razorpay Payments
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Run a Razorpay test checkout and keep your payment history in one place.
              </p>
            </div>

            <div className="rounded-[24px] border border-[rgba(14,165,233,0.14)] bg-[var(--color-muted-surface)] p-4">
              <label className="block">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Amount in INR
                </span>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-[16px] border border-slate-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[rgba(14,165,233,0.18)]"
                />
              </label>
              <div className="mt-4">
                <PaymentButton amount={amount} userId={userId} user={user} onSuccess={fetchPayments} />
              </div>
            </div>
          </div>
        </section>

        <section className="reveal-up reveal-delay-1 mt-6 rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_18px_50px_rgba(17,31,26,0.06)] backdrop-blur-xl sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">History</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">Your Payments</h2>
            </div>
            <Receipt className="h-6 w-6 text-[var(--color-primary)]" />
          </div>

          <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-100">
            {paymentsLoading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm font-semibold text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading payments
              </div>
            ) : payments.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                  <thead className="bg-[var(--color-muted-surface)] text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Payment ID</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {payments.map((payment) => (
                      <tr key={payment._id}>
                        <td className="px-4 py-4 font-semibold text-slate-900">INR {Number(payment.amount || 0).toFixed(2)}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                            payment.status === 'success' || payment.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-slate-500">
                          {payment.razorpay_payment_id || payment.transactionId || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-slate-500">{formatDate(payment.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center">
                <CreditCard className="mx-auto h-8 w-8 text-[var(--color-primary)]" />
                <p className="mt-3 text-sm font-semibold text-slate-900">No payments yet</p>
                <p className="mt-1 text-sm text-slate-500">Your Razorpay test payments will appear here.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Payments;
