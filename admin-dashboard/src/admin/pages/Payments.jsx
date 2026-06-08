import React, { useEffect, useMemo, useState } from 'react';
import { FaCalendarAlt, FaFileCsv, FaSearch } from 'react-icons/fa';
import { MdPayments } from 'react-icons/md';
import Table from '../../components/Table';
import { paymentsAPI } from '../../services/api';

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString();
};

const getUserLabel = (row) => row.user?.name || row.userId || 'N/A';
const getPaymentId = (row) => row.razorpay_payment_id || row.transactionId || 'N/A';
const getOrderId = (row) => row.razorpay_order_id || row.booking?.bookingReference || 'N/A';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentsAPI.getAdminRazorpayPayments();
      setPayments(response.data?.data?.payments || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return payments.filter((payment) =>
      getUserLabel(payment).toLowerCase().includes(search) ||
      getPaymentId(payment).toLowerCase().includes(search) ||
      getOrderId(payment).toLowerCase().includes(search) ||
      String(payment.status || '').toLowerCase().includes(search)
    );
  }, [payments, searchTerm]);

  const handleExportCSV = () => {
    const headers = ['User,Amount,Status,Payment ID,Order ID,Date'];
    const rows = filteredPayments.map((payment) => [
      `"${getUserLabel(payment)}"`,
      Number(payment.amount || 0).toFixed(2),
      payment.status || 'N/A',
      getPaymentId(payment),
      getOrderId(payment),
      formatDate(payment.createdAt),
    ].join(','));

    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Razorpay_Payments_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      header: 'USER',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-gray-100">{getUserLabel(row)}</div>
          <div className="mt-1 text-xs text-slate-400">{row.user?.email || row.userId || 'Standalone payment'}</div>
        </div>
      ),
    },
    {
      header: 'AMOUNT',
      render: (row) => <span className="font-black text-slate-900 dark:text-gray-100">INR {Number(row.amount || 0).toFixed(2)}</span>,
    },
    {
      header: 'STATUS',
      render: (row) => {
        const isSuccess = row.status === 'success' || row.status === 'completed';
        const isPending = row.status === 'pending' || row.status === 'processing';
        return (
          <span className={`rounded-lg px-4 py-1.5 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ${
            isSuccess
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-green-900/20 dark:text-green-400'
              : isPending
                ? 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-yellow-900/20 dark:text-yellow-400'
                : 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {row.status || 'N/A'}
          </span>
        );
      },
    },
    {
      header: 'PAYMENT ID',
      render: (row) => <span className="font-mono text-xs text-blue-500">{getPaymentId(row)}</span>,
    },
    {
      header: 'ORDER ID',
      render: (row) => <span className="font-mono text-xs text-slate-500">{getOrderId(row)}</span>,
    },
    {
      header: 'METHOD',
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400">
          <MdPayments className="text-blue-500" />
          <span>{row.paymentGateway || row.paymentMethod || 'razorpay'}</span>
        </div>
      ),
    },
    {
      header: 'DATE',
      render: (row) => (
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400">
          <FaCalendarAlt className="opacity-70" />
          <span>{formatDate(row.createdAt)}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 transition-colors duration-300 dark:bg-[#0f172a] lg:p-10">
      <div className="mb-8 flex flex-col items-end justify-between gap-6 md:flex-row">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Payments</h1>
          <p className="mt-2 font-medium text-slate-500 dark:text-slate-400">
            Razorpay test transactions and billing history
          </p>
        </div>

        <div className="flex w-full items-center gap-4 md:w-auto">
          <div className="group relative flex-grow md:w-80">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search user, payment, order, status..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-2xl bg-white py-3 pl-12 pr-4 text-sm shadow-sm ring-1 ring-slate-200 outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:bg-[#1e293b] dark:text-white dark:ring-slate-700"
            />
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="rounded-2xl bg-white p-3.5 text-emerald-600 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50 dark:bg-[#1e293b] dark:text-emerald-400 dark:ring-slate-700 dark:hover:bg-slate-800"
          >
            <FaFileCsv size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl dark:border-slate-800 dark:bg-[#1e293b]/40 dark:shadow-none">
        <Table
          columns={columns}
          data={filteredPayments}
          loading={loading}
          emptyMessage="No payment records found"
        />

        {!loading && filteredPayments.length === 0 && searchTerm ? (
          <div className="py-20 text-center font-medium text-slate-400 dark:text-slate-500">
            No payments found matching "{searchTerm}"
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Payments;
