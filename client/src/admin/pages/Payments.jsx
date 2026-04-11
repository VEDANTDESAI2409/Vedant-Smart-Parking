import React, { useState, useEffect, useMemo } from 'react';
import { FaTrash, FaSearch, FaCalendarAlt, FaFileCsv } from 'react-icons/fa';
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
          {/* Edit button removed per request */}
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
