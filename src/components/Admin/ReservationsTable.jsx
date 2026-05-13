import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

export default function ReservationsTable() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('view_dashboard_reservations')
      .select('*')
      .order('booking_date', { ascending: true });
    
    if (!error) setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) fetchBookings(); // Recargar datos tras actualizar
  };

  if (loading) return <p className="text-slate-500">Cargando reservaciones...</p>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="p-4 font-semibold text-slate-700">Cliente</th>
            <th className="p-4 font-semibold text-slate-700">Servicio / Fecha</th>
            <th className="p-4 font-semibold text-slate-700">Total</th>
            <th className="p-4 font-semibold text-slate-700">Pagado</th>
            <th className="p-4 font-semibold text-slate-700">Estatus</th>
            <th className="p-4 font-semibold text-slate-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
              <td className="p-4">
                <p className="font-bold text-slate-800">{b.customer_name}</p>
                <p className="text-xs text-slate-500">{b.customer_email}</p>
              </td>
              <td className="p-4">
                <p className="text-sm font-medium text-slate-700">{b.yacht_service}</p>
                <p className="text-xs text-slate-500">{b.booking_date} • {b.booking_time}</p>
              </td>
              <td className="p-4 font-semibold text-slate-700">${b.total_amount}</td>
              <td className="p-4">
                <span className={`text-sm font-bold ${b.amount_paid >= b.total_amount ? 'text-green-600' : 'text-orange-500'}`}>
                  ${b.amount_paid}
                </span>
              </td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                  b.booking_status === 'paid' ? 'bg-green-100 text-green-700' : 
                  b.booking_status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                }`}>
                  {b.booking_status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(b.id, 'paid')} className="p-1 hover:text-green-600" title="Marcar como pagado">
                    <CheckCircle size={20} />
                  </button>
                  <button onClick={() => updateStatus(b.id, 'canceled')} className="p-1 hover:text-red-600" title="Cancelar">
                    <XCircle size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}