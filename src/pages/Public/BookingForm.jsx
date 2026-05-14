import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_live_51TWXtnL7LdV3fEePqbqb3CcvUv846TGTbDK4qrtSN9q7jbU75eSJX99jRX4LLAf5Ma4B9WTd8pSKc5MsIoYw8Hib00yYLr0wI9');

export default function BookingForm() {
  // --- ESTADOS ---
  const [vessels, setVessels] = useState([]);
  const [services, setServices] = useState([]);
  const [addons, setAddons] = useState([]);
  const [schedules, setSchedules] = useState([]);
  
  const [selectedVessel, setSelectedVessel] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedAddons, setSelectedAddons] = useState({});
  
  const [showAmenities, setShowAmenities] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openCategory, setOpenCategory] = useState(null); // Control de acordeón
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', date: '', time: '', pax: 1
  });

  // --- ESTILOS ADICIONALES (Animaciones) ---
  const customStyles = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `;

  // --- CARGA DE DATOS INICIALES ---
  useEffect(() => {
    const loadInitialData = async () => {
      const { data: vsl } = await supabase.from('vessels').select('*');
      const { data: add } = await supabase.from('add_ons').select('*');
      setVessels(vsl || []);
      setAddons(add || []);
    };
    loadInitialData();
  }, []);

  // --- FILTRADO DE SERVICIOS POR BARCO ---
  useEffect(() => {
    if (selectedVessel) {
      const loadServices = async () => {
        const { data } = await supabase
          .from('services')
          .select('*')
          .eq('vessel_id', selectedVessel);
        setServices(data || []);
        setSelectedService('');
      };
      loadServices();
    } else {
      setServices([]);
    }
  }, [selectedVessel]);

  // --- CARGA DE HORARIOS POR SERVICIO ---
  useEffect(() => {
    if (selectedService) {
      const loadSchedules = async () => {
        const { data } = await supabase
          .from('service_schedules')
          .select('*')
          .eq('service_id', selectedService);
        setSchedules(data || []);
      };
      loadSchedules();
    }
  }, [selectedService]);

  // --- AGRUPACIÓN DE ADDONS ---
  const groupedAddons = addons.reduce((acc, addon) => {
    const cat = addon.category || 'Otros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(addon);
    return acc;
  }, {});

  const getCategoryEmoji = (cat) => {
    const map = {
      'Vinos': '🍷',
      'Licores': '🥃',
      'Mezcales': '🌵',
      'Alimentos': '🍱',
      'Bebidas': '🥤',
      'Experiencias': '✨'
    };
    return map[cat] || '⚓';
  };

  // --- LÓGICA DE CÁLCULO ---
  const updateAddonQty = (id, delta) => {
    setSelectedAddons(prev => {
      const currentQty = prev[id] || 0;
      const newQty = Math.max(0, currentQty + delta);
      return { ...prev, [id]: newQty };
    });
  };

  const calculateTotal = () => {
    const servicePrice = services.find(s => s.id === selectedService)?.base_price_mxn || 0;
    const addonsTotal = Object.entries(selectedAddons).reduce((acc, [id, qty]) => {
      const addon = addons.find(a => a.id === id);
      return acc + (addon ? addon.price_mxn * qty : 0);
    }, 0);
    return servicePrice + addonsTotal;
  };

  const cartItems = Object.entries(selectedAddons)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const item = addons.find(a => a.id === id);
      return { ...item, qty };
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const total = calculateTotal();
    const stripe = await stripePromise;

    try {
      const { data: booking, error: dbError } = await supabase
        .from('bookings')
        .insert([{
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          booking_date: formData.date,
          booking_time: formData.time,
          service_id: selectedService,
          total_amount: total,
          status: 'pending_payment',
          addons_details: cartItems
        }])
        .select().single();

      if (dbError) throw dbError;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          bookingId: booking.id,
          total: total,
          email: formData.email,
          items: [
            { name: services.find(s => s.id === selectedService)?.name, price: services.find(s => s.id === selectedService)?.base_price_mxn },
            ...cartItems.map(i => ({ name: i.name, price: i.price_mxn, qty: i.qty }))
          ]
        })
      });

      const session = await response.json();
      if (session.error) throw new Error(session.error);
      await stripe.redirectToCheckout({ sessionId: session.id });
    } catch (err) {
      alert("Hubo un problema: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#1a2e4a]">
      <style>{customStyles}</style>
      
      <nav className="px-6 md:px-12 py-6 flex justify-between items-center border-b border-[#e2eff0] bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="text-xl md:text-2xl font-serif italic font-semibold">
          Rogues <span className="text-[#4ec6c6]">Yacht Co.</span>
        </Link>
        <Link to="/" className="text-sm font-semibold text-gray-400 hover:text-[#4ec6c6] transition">← REGRESAR</Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          <div className="lg:col-span-7 space-y-10">
            <div className="rounded-[40px] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1567899378494-47b22a2bb96a?auto=format&fit=crop&q=80&w=1200" 
                alt="Yacht" className="w-full h-[500px] object-cover"
              />
            </div>
            <div>
              <h1 className="text-6xl font-serif mb-6">Navega hacia lo extraordinario.</h1>
              <p className="text-gray-500 text-xl leading-relaxed">Personaliza tu experiencia a bordo de nuestras embarcaciones Sea Ray y Bayliner.</p>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="bg-white border border-[#e2eff0] rounded-[48px] p-10 shadow-2xl shadow-blue-900/10 sticky top-32">
              <h2 className="text-2xl font-serif mb-8 border-b pb-4">Reserva tu Experiencia</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <input type="text" placeholder="Nombre completo" required className="w-full p-4 bg-[#f8fafb] border border-[#e2eff0] rounded-2xl" onChange={e => setFormData({...formData, name: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-4">
                  <input type="email" placeholder="Email" required className="w-full p-4 bg-[#f8fafb] border border-[#e2eff0] rounded-2xl text-sm" onChange={e => setFormData({...formData, email: e.target.value})} />
                  <input type="tel" placeholder="WhatsApp" required className="w-full p-4 bg-[#f8fafb] border border-[#e2eff0] rounded-2xl text-sm" onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1 block">1. Selecciona la embarcación</label>
                  <select required className="w-full p-4 bg-[#f8fafb] border border-[#e2eff0] rounded-2xl font-bold" value={selectedVessel} onChange={e => setSelectedVessel(e.target.value)}>
                    <option value="">Elige un yate...</option>
                    {vessels.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>

                <div className={!selectedVessel ? 'opacity-40 pointer-events-none' : ''}>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-1 block">2. Selecciona la duración</label>
                  <select required disabled={!selectedVessel} className="w-full p-4 bg-[#f8fafb] border border-[#e2eff0] rounded-2xl font-bold text-[#4ec6c6]" value={selectedService} onChange={e => setSelectedService(e.target.value)}>
                    <option value="">¿Cuántas horas?</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name} (${s.base_price_mxn.toLocaleString()})</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input type="date" required className="w-full p-4 bg-[#f8fafb] border border-[#e2eff0] rounded-2xl text-sm" onChange={e => setFormData({...formData, date: e.target.value})} />
                  <select required className="w-full p-4 bg-[#f8fafb] border border-[#e2eff0] rounded-2xl text-sm" onChange={e => setFormData({...formData, time: e.target.value})}>
                    <option value="">Horario</option>
                    {schedules.map(h => <option key={h.id} value={h.start_time}>{h.label}</option>)}
                  </select>
                </div>

                <button type="button" onClick={() => setShowAmenities(true)} className="w-full py-4 border-2 border-dashed border-[#4ec6c6] bg-[#f7fbfb] rounded-2xl font-bold hover:bg-[#4ec6c6]/5 transition">
                  ✨ Personalizar Extras Gourmet
                </button>

                {cartItems.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-blue-50">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between text-xs">
                        <span className="text-gray-600">{item.qty}x {item.name}</span>
                        <span className="font-bold">${(item.price_mxn * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-6 border-t border-[#e2eff0]">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Total MXN</span>
                    <span className="text-4xl font-serif font-bold text-[#1a2e4a]">${calculateTotal().toLocaleString()}</span>
                  </div>
                  <button type="submit" disabled={loading || !selectedService} className="w-full bg-[#1a2e4a] text-white py-6 rounded-full font-bold text-lg hover:bg-[#4ec6c6] transition-all shadow-xl disabled:bg-gray-300">
                    {loading ? "Preparando embarque..." : "Reservar con Stripe"}
                  </button>
                </div>
              </form>
            </div>
          </aside>
        </div>
      </div>

      {/* MODAL DE AMENITIES CON ACORDEONES */}
      {showAmenities && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-[#1a2e4a]/85 backdrop-blur-xl" onClick={() => setShowAmenities(false)}></div>
          
          <div className="relative bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-8 border-b text-center">
              <h2 className="text-3xl font-serif">Personaliza tu Experiencia</h2>
              <p className="text-gray-400 text-sm mt-2">Selecciona los extras gourmet para tu viaje</p>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 bg-[#f8fafb] no-scrollbar">
              {Object.keys(groupedAddons).map((category) => (
                <div key={category} className="bg-white rounded-3xl border border-[#e2eff0] overflow-hidden shadow-sm transition-all">
                  <button 
                    onClick={() => setOpenCategory(openCategory === category ? null : category)}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="bg-[#4ec6c6]/10 text-[#4ec6c6] p-2 rounded-xl text-xl">
                        {getCategoryEmoji(category)}
                      </span>
                      <span className="font-bold uppercase tracking-widest text-sm text-[#1a2e4a]">{category}</span>
                      <span className="bg-gray-100 text-[10px] px-2 py-1 rounded-full text-gray-500">
                        {groupedAddons[category].length} items
                      </span>
                    </div>
                    <span className={`text-xl transition-transform duration-300 ${openCategory === category ? 'rotate-180' : ''}`}>
                      ⌄
                    </span>
                  </button>

                  {openCategory === category && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-[#f0f7f8] animate-fadeIn">
                      {groupedAddons[category].map(a => (
                        <AddonCard 
                          key={a.id} 
                          addon={a} 
                          qty={selectedAddons[a.id] || 0} 
                          update={updateAddonQty} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-8 border-t bg-white flex justify-between items-center">
              <div>
                 <p className="text-[10px] uppercase font-bold text-gray-400">Total en extras</p>
                 <p className="text-xl font-bold text-[#4ec6c6]">
                   ${cartItems.reduce((acc, item) => acc + (item.price_mxn * item.qty), 0).toLocaleString()} MXN
                 </p>
              </div>
              <button 
                onClick={() => setShowAmenities(false)} 
                className="bg-[#1a2e4a] text-white px-10 py-4 rounded-full font-bold hover:bg-[#4ec6c6] transition-all transform hover:scale-105"
              >
                Confirmar Selección
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddonCard({ addon, qty, update }) {
  return (
    <div className={`p-4 rounded-[24px] border transition-all ${qty > 0 ? 'border-[#4ec6c6] bg-[#4ec6c6]/5 shadow-sm' : 'border-[#e2eff0] bg-white'}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="font-bold text-[#3ab5b5] text-sm">${addon.price_mxn.toLocaleString()}</span>
      </div>
      <h4 className="font-bold text-[11px] uppercase mb-3 text-[#1a2e4a] leading-tight h-8 line-clamp-2">
        {addon.name}
      </h4>
      <div className="flex items-center justify-between bg-white rounded-full p-1 border">
        <button type="button" onClick={() => update(addon.id, -1)} className="w-7 h-7 flex items-center justify-center font-bold text-gray-400 hover:text-red-500 transition-colors">-</button>
        <span className="font-bold text-xs">{qty}</span>
        <button type="button" onClick={() => update(addon.id, 1)} className="w-7 h-7 flex items-center justify-center font-bold text-[#1a2e4a] hover:text-[#4ec6c6] transition-colors">+</button>
      </div>
    </div>
  );
}