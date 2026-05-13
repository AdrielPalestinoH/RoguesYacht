import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../api/supabase';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-[#1a2e4a] text-white min-h-screen fixed left-0 top-0 p-6 flex flex-col">
      <div className="mb-10 text-2xl font-serif italic">
        Rogues <span className="text-[#4ec6c6]">Admin</span>
      </div>
      

<nav className="flex-1 space-y-2">
  <Link to="/dashboard" className="block p-3 rounded-lg hover:bg-white/10 transition">📊 Dashboard</Link>
  <Link to="/dashboard/services" className="block p-3 rounded-lg hover:bg-white/10 transition">🛥️ Servicios (Yates)</Link>
  <Link to="/dashboard/reservations" className="block p-3 rounded-lg hover:bg-white/10 transition">📅 Reservaciones</Link>
  <Link to="/dashboard/inventory" className="block p-3 rounded-lg hover:bg-white/10 transition">🍾 Inventario Add-ons</Link>
</nav>

      <button 
        onClick={handleLogout}
        className="mt-auto p-3 text-left text-red-400 hover:text-red-300 font-bold transition"
      >
        Cerrar Sesión
      </button>
    </aside>
  );
}