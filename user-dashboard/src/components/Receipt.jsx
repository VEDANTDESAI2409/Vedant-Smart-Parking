import React from 'react';
import { Download, X } from 'lucide-react';
import ReceiptTicket, {
  buildTicketReceiptHtml,
  normalizeBookingReceipt,
} from './ReceiptTicket';

const Receipt = ({ booking, onClose }) => {
  if (!booking) return null;

  const receipt = normalizeBookingReceipt(booking);

  const downloadReceipt = () => {
    const receiptHtml = buildTicketReceiptHtml(receipt);
    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ParkNGo_Parking_Ticket_${booking.receiptNumber || booking._id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full py-5">
        <ReceiptTicket
          receipt={receipt}
          className="animate-[receipt-pop_260ms_ease-out]"
          actions={
            <>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Close
              </button>
              <button
                type="button"
                onClick={downloadReceipt}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </>
          }
        />
      </div>
    </div>
  );
};

export default Receipt;
