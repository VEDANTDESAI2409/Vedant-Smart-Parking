import React, { useState, useEffect, useMemo } from 'react';
import { FaTrash, FaSearch, FaCalendarAlt, FaFileCsv, FaFileInvoice } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { MdPayments } from "react-icons/md";
import Table from '../../components/Table';
import { paymentsAPI } from '../../services/api';
import { showSuccess } from '../../utils/toastService';

const Payments = () => {
  const [payments, setPayments] = useState([
    { _id: 'P001', booking: { bookingReference: 'BK101' }, user: { _id: 'U001', name: 'John Doe' }, amount: 25.00, paymentMethod: 'Card', status: 'COMPLETED', createdAt: '18/03/2026' },
    { _id: 'P002', booking: { bookingReference: 'BK102' }, user: { _id: 'U002', name: 'Jane Smith' }, amount: 15.50, paymentMethod: 'Wallet', status: 'COMPLETED', createdAt: '18/03/2026' },
    { _id: 'P003', booking: { bookingReference: 'BK103' }, user: { _id: 'U003', name: 'Bob Johnson' }, amount: 40.00, paymentMethod: 'UPI', status: 'PENDING', createdAt: '17/03/2026' },
    { _id: 'P004', booking: { bookingReference: 'BK104' }, user: { _id: 'U004', name: 'Alice Brown' }, amount: 10.00, paymentMethod: 'Card', status: 'COMPLETED', createdAt: '17/03/2026' },
    { _id: 'P005', booking: { bookingReference: 'BK105' }, user: { _id: 'U005', name: 'Charlie Davis' }, amount: 55.00, paymentMethod: 'Net Banking', status: 'FAILED', createdAt: '16/03/2026' },
  ]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentsAPI.getAll();
      const apiData = response.data?.data?.payments || response.data || [];
      if (apiData.length > 0) setPayments(apiData);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Delete Logic: Filters the current state to remove the ID
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Payment Record?',
      text: 'This payment entry will be removed from the list.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      background: '#ffffff',
      color: '#0f172a',
      borderRadius: '12px',
    });

    if (result.isConfirmed) {
      setPayments(prev => prev.filter(p => p._id !== id));
      showSuccess('Payment record deleted successfully');
      // Optional: Add API call here -> await paymentsAPI.delete(id);
    }
  };

  // 2. CSV Export Logic: Generates and downloads the file
  const handleExportCSV = () => {
    const headers = ["Booking ID,User ID,Name,Amount,Method,Status,Date"];
    const rows = filteredPayments.map(p => [
      p.booking?.bookingReference || 'N/A',
      p.user?._id || 'N/A',
      `"${p.user?.name || 'N/A'}"`,
      p.amount.toFixed(2),
      p.paymentMethod,
      p.status,
      p.createdAt
    ].join(","));

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Payments_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPayments = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return payments.filter((p) => 
      p.user?.name?.toLowerCase().includes(search) ||
      p.booking?.bookingReference?.toLowerCase().includes(search) ||
      p._id?.toLowerCase().includes(search)
    );
  }, [payments, searchTerm]);

  const columns = [
    { 
      header: 'BOOKING ID', 
      render: (row) => (
        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg font-bold text-xs border border-blue-100 dark:border-blue-800/50 font-mono">
          {row.booking?.bookingReference || 'N/A'}
        </span>
      )
    },
    { 
      header: 'USER ID', 
      render: (row) => <span className="text-blue-400 text-xs font-semibold">{row.user?._id || 'N/A'}</span> 
    },
    { 
      header: 'NAME', 
      render: (row) => <span className="text-slate-900 dark:text-gray-100 font-bold">{row.user?.name || 'N/A'}</span> 
    },
    { 
      header: 'AMOUNT', 
      render: (row) => <span className="text-slate-900 dark:text-gray-100 font-black">₹{row.amount.toFixed(2)}</span> 
    },
    { 
      header: 'METHOD', 
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-sm">
          <MdPayments className="text-blue-500" />
          <span>{row.paymentMethod}</span>
        </div>
      )
    },
    { 
      header: 'STATUS', 
      render: (row) => (
        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ring-1 ring-inset ${
          row.status === 'COMPLETED' 
            ? 'bg-emerald-50 dark:bg-green-900/20 text-emerald-700 dark:text-green-400 ring-emerald-600/20 dark:ring-green-900/50' 
            : row.status === 'PENDING'
            ? 'bg-amber-50 dark:bg-yellow-900/20 text-amber-700 dark:text-yellow-400 ring-amber-600/20 dark:ring-yellow-900/50'
            : 'bg-rose-50 dark:bg-red-900/20 text-rose-700 dark:text-red-400 ring-rose-600/20 dark:ring-red-900/50'
        }`}>
          {row.status}
        </span>
      )
    },
    { 
      header: 'DATE', 
      render: (row) => (
        <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-sm">
          <FaCalendarAlt className="opacity-70" />
          <span>{row.createdAt}</span>
        </div>
      )
    },
    { 
      header: 'ACTION', 
      render: (row) => (
        <div className="flex gap-2">
          <button 
            onClick={() => {
              const receiptHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Park N Go Payment Receipt</title>
  <style>
    body {
      margin: 0;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f3f4f6;
      color: #111827;
    }
    .receipt-wrapper {
      max-width: 860px;
      margin: 32px auto;
      padding: 32px;
      background: #ffffff;
      border-radius: 28px;
      box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
      border: 1px solid #e5e7eb;
    }
    .receipt-top {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: flex-start;
      margin-bottom: 32px;
    }
    .brand-title {
      font-size: 2rem;
      font-weight: 800;
      margin: 0;
      color: #0f172a;
    }
    .brand-tagline {
      margin: 8px 0 0;
      color: #475569;
      font-size: 0.96rem;
    }
    .receipt-meta {
      text-align: right;
    }
    .receipt-meta span {
      display: block;
      font-size: 0.95rem;
      color: #475569;
    }
    .receipt-meta strong {
      display: block;
      margin-top: 6px;
      font-size: 1.1rem;
      color: #0f172a;
    }
    .section {
      margin-bottom: 28px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }
    .section-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      padding: 10px 16px;
      border-radius: 9999px;
      background: #ecfdf5;
      color: #164e63;
      font-weight: 700;
      font-size: 0.88rem;
    }
    .grid-two {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
    }
    .field {
      border-radius: 16px;
      background: #f8fafc;
      padding: 18px 20px;
      line-height: 1.6;
    }
    .field-label {
      font-size: 0.88rem;
      color: #475569;
      margin-bottom: 8px;
    }
    .field-value {
      font-weight: 700;
      color: #0f172a;
    }
    .summary-card {
      border-radius: 22px;
      background: #eef2ff;
      padding: 24px;
      display: grid;
      gap: 14px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      color: #334155;
      font-size: 0.98rem;
    }
    .summary-row strong {
      color: #0f172a;
    }
    .summary-total {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #c7d2fe;
      padding-top: 16px;
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f172a;
    }
    .footer {
      margin-top: 16px;
      padding-top: 18px;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 0.94rem;
    }
  </style>
</head>
<body>
  <div class="receipt-wrapper">
    <div class="receipt-top">
      <div>
        <h1 class="brand-title">Park N Go</h1>
        <p class="brand-tagline">Your smart parking payment record</p>
      </div>
      <div class="receipt-meta">
        <span>Receipt ID</span>
        <strong>${row._id}</strong>
        <span>Date</span>
        <strong>${row.createdAt}</strong>
      </div>
    </div>

    <div class="section section-header">
      <h2 class="section-title">Payment Overview</h2>
      <div class="status-pill">${row.status}</div>
    </div>

    <div class="grid-two">
      <div class="field">
        <div class="field-label">Customer</div>
        <div class="field-value">${row.user?.name || 'N/A'}</div>
        <div class="field-label">Email</div>
        <div>${row.user?.email || 'N/A'}</div>
      </div>
      <div class="field">
        <div class="field-label">Booking Reference</div>
        <div class="field-value">${row.booking?.bookingReference || 'N/A'}</div>
        <div class="field-label">Parking Location</div>
        <div>${row.booking?.locationSnapshot?.locationName || 'N/A'}</div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">Payment Details</h3>
      <div class="summary-card">
        <div class="summary-row">
          <span>Amount paid</span>
          <strong>₹${row.amount.toFixed(2)}</strong>
        </div>
        <div class="summary-row">
          <span>Payment method</span>
          <strong>${row.paymentMethod || 'N/A'}</strong>
        </div>
        <div class="summary-row">
          <span>Booked slot</span>
          <strong>${row.booking?.locationSnapshot?.slotNumber || 'N/A'}</strong>
        </div>
        <div class="summary-total">
          <span>Total</span>
          <span>₹${row.amount.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for using Park N Go. Please keep this receipt for your records.</p>
      <p>If you need help, contact <a href="mailto:support@parkngo.com">support@parkngo.com</a>.</p>
    </div>
  </div>
</body>
</html>`;

              const blob = new Blob([receiptHtml], { type: 'text/html' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Payment_Receipt_${row._id}.html`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="p-2 text-blue-500 bg-blue-50 dark:bg-blue-900/10 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors shadow-sm"
            title="Download Receipt"
          >
            <FaFileInvoice size={14}/>
          </button>
          <button 
            onClick={() => handleDelete(row._id)}
            className="p-2 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors shadow-sm"
          >
            <FaTrash size={14}/>
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] p-6 lg:p-10 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Payments</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Manage customer transactions and billing history</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80 group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Search ID, name, or date..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1e293b] border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white transition-all"
            />
          </div>
          <button 
            onClick={handleExportCSV}
            className="p-3.5 bg-white dark:bg-[#1e293b] ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl shadow-sm text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FaFileCsv size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e293b]/40 rounded-[2.5rem] shadow-xl dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-800">
        <Table 
          columns={columns} 
          data={filteredPayments} 
          loading={loading} 
          emptyMessage="No payment records found" 
        />
        
        {!loading && filteredPayments.length === 0 && (
          <div className="py-20 text-center text-slate-400 dark:text-slate-500 font-medium">
            No payments found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
