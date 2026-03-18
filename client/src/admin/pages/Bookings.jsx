import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaFileCsv, FaArrowLeft, FaUser, FaMapMarkerAlt, FaCar, FaSearch, FaChevronRight } from 'react-icons/fa';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Table from '../../components/Table';
import Card from '../../components/Card';

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const mockData = [
    {
      id: "raw-1", createdAt: "2024-05-10T10:30:00Z", vehicleType: "car", slotType: "Premium",
      status: "reserved", paymentStatus: "paid", totalAmount: 500, city: "Mumbai",
      area: "Andheri West", pincode: "400053", landmark: "Opposite Infinity Mall",
      user: { name: "Rahul Sharma", phone: "+91 98765 43210", email: "rahul@example.com" },
      slot: { location: "P1-Level 2", slotNumber: "A-101" }
    },
    {
      id: "raw-2", createdAt: "2024-05-11T14:20:00Z", vehicleType: "bike", slotType: "Standard",
      status: "unreserved", paymentStatus: "unpaid", totalAmount: 150, city: "Pune",
      area: "Kothrud", pincode: "411038", landmark: "Near City Pride Cinema",
      user: { name: "Sneha Patil", phone: "+91 91234 56789", email: "sneha.p@test.com" },
      slot: { location: "B1-Ground", slotNumber: "B-22" }
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const formatted = mockData.map((b, index) => ({
        ...b,
        customId: `${b.vehicleType === 'car' ? 'C' : 'B'}${String(index + 1).padStart(3, '0')}`,
        bookingDate: new Date(b.createdAt).toLocaleDateString(),
        userName: b.user.name,
        mobileNumber: b.user.phone,
        emailId: b.user.email,
        slotLocation: b.slot.location,
        slotNumber: b.slot.slotNumber 
      }));
      setBookings(formatted);
      setLoading(false);
    }, 500);
  }, []);

  // --- WORKING CSV EXPORT LOGIC ---
  const handleExportCSV = () => {
    if (bookings.length === 0) return;

    // Define Headers
    const headers = [
      "User ID", "Date", "Customer Name", "Mobile", "Email", 
      "Vehicle Type", "Slot Type", "Slot Number", "Location", 
      "City", "Area", "Pincode", "Landmark", "Status", "Amount", "Payment"
    ];

    // Map data to rows
    const csvRows = bookings.map(b => [
      b.customId,
      b.bookingDate,
      `"${b.userName}"`, // Wrap names in quotes to handle commas
      b.mobileNumber,
      b.emailId,
      b.vehicleType.toUpperCase(),
      b.slotType,
      b.slotNumber,
      `"${b.slotLocation}"`,
      b.city,
      `"${b.area}"`,
      b.pincode,
      `"${b.landmark}"`,
      b.status.toUpperCase(),
      b.totalAmount,
      b.paymentStatus.toUpperCase()
    ].join(","));

    // Combine headers and rows
    const csvContent = [headers.join(","), ...csvRows].join("\n");
    
    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ParkNGo_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { 
      header: 'USER ID', 
      render: (row) => (
        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg font-bold text-xs border border-blue-100 dark:border-blue-800">
          {row.customId}
        </span>
      ) 
    },
    { 
      header: 'CUSTOMER', 
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-800 dark:text-gray-100">{row.userName}</span>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{row.mobileNumber}</span>
        </div>
      ) 
    },
    { 
      header: 'VEHICLE', 
      render: (row) => (
        <div className="flex items-center gap-2 capitalize text-gray-600 dark:text-gray-400 font-semibold text-sm">
          <span className={`w-2 h-2 rounded-full ${row.vehicleType === 'car' ? 'bg-orange-400' : 'bg-blue-400'}`}></span>
          {row.vehicleType}
        </div>
      ) 
    },
    { 
      header: 'STATUS', 
      render: (row) => (
        <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ring-1 ring-inset transition-all ${
          row.status === 'reserved' 
            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-600/20' 
            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 ring-slate-600/20'
        }`}>
          {row.status}
        </span>
      ) 
    },
    { 
      header: 'AMOUNT', 
      render: (row) => <span className="text-gray-900 dark:text-white font-black text-base">₹{row.totalAmount}</span> 
    },
    { 
      header: 'ACTION', 
      render: (row) => (
        <button 
          onClick={() => setViewingBooking(row)} 
          className="group flex items-center gap-2 bg-[#1E293B] dark:bg-blue-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-all active:scale-95 text-xs font-bold"
        >
          VIEW DETAIL <FaChevronRight className="group-hover:translate-x-1 transition-transform" size={10}/>
        </button>
      ) 
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] p-6 lg:p-10 font-sans transition-colors duration-300">
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Bookings</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage and audit your parking inventory</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-80 group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by ID or name..." 
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1E293B] border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm dark:text-white"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* UPDATED BUTTON: Added onClick={handleExportCSV} */}
          <button 
            onClick={handleExportCSV}
            className="p-3.5 bg-white dark:bg-[#1E293B] ring-1 ring-slate-200 dark:ring-slate-700 rounded-2xl shadow-sm text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FaFileCsv size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-xl dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-800">
        <Table 
          columns={columns} 
          data={bookings.filter(b => b.userName.toLowerCase().includes(searchTerm.toLowerCase()) || b.customId.toLowerCase().includes(searchTerm.toLowerCase()))} 
          loading={loading} 
        />
      </div>

      <Modal isOpen={!!viewingBooking} onClose={() => setViewingBooking(null)}>
        {viewingBooking && (
          <div className="p-2 bg-white dark:bg-[#1E293B] text-gray-900 dark:text-gray-100">
            <div className="flex justify-between items-start mb-8 border-b dark:border-slate-700 pb-6">
              <div>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">Reservation Record</span>
                <h2 className="text-3xl font-black mt-2">{viewingBooking.customId}</h2>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Booking Date</p>
                <p className="font-bold">{viewingBooking.bookingDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-8">
                <section>
                  <h3 className="flex items-center gap-2 font-bold text-sm mb-4 border-b dark:border-slate-700 pb-2">
                    <FaUser className="text-blue-500"/> Customer Profile
                  </h3>
                  <div className="space-y-3">
                    <ModalField label="Full Name" value={viewingBooking.userName} />
                    <ModalField label="Mobile" value={viewingBooking.mobileNumber} />
                    <ModalField label="Email" value={viewingBooking.emailId} />
                  </div>
                </section>
                <section>
                  <h3 className="flex items-center gap-2 font-bold text-sm mb-4 border-b dark:border-slate-700 pb-2">
                    <FaCar className="text-blue-500"/> Vehicle & Slot Info
                  </h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <ModalField label="Vehicle Type" value={viewingBooking.vehicleType} isCaps />
                    <ModalField label="Class" value={viewingBooking.slotType} />
                    <ModalField label="Location" value={viewingBooking.slotLocation} />
                    <ModalField label="Slot No" value={viewingBooking.slotNumber} />
                  </div>
                </section>
              </div>

              <div className="space-y-8">
                <section className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl space-y-4">
                  <h3 className="flex items-center gap-2 font-bold text-sm mb-2">
                    <FaMapMarkerAlt className="text-blue-500"/> Location Pin
                  </h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <ModalField label="City" value={viewingBooking.city} />
                    <ModalField label="Pincode" value={viewingBooking.pincode} />
                    <ModalField label="Area" value={viewingBooking.area} span={2} />
                    <ModalField label="Landmark" value={viewingBooking.landmark} span={2} />
                  </div>
                </section>

                <div className="bg-blue-600 rounded-3xl p-6 text-white flex justify-between items-center shadow-lg shadow-blue-200 dark:shadow-none">
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-70">Payment Status</p>
                    <p className="text-xl font-black uppercase">{viewingBooking.paymentStatus}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase opacity-70">Total Amount</p>
                    <p className="text-4xl font-black">₹{viewingBooking.totalAmount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const ModalField = ({ label, value, span = 1, isCaps }) => (
  <div className={span === 2 ? 'col-span-2' : 'col-span-1'}>
    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter leading-none mb-1">{label}</p>
    <p className={`font-bold dark:text-gray-100 ${isCaps ? 'uppercase' : ''}`}>{value || '---'}</p>
  </div>
);

export default Bookings;