import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { Link } from 'react-router-dom';

export default function BookingForm() {
  const [services, setServices] = useState([]);
  const [addons, setAddons] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [showAmenities, setShowAmenities] = useState(false);
  
  const [selectedService, setSelectedService] = useState('');
  const [selectedAddons, setSelectedAddons] = useState({}); // { id: cantidad }
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', date: '', time: '', pax: 1
  });

useEffect(() => {
  const loadData = async () => {
    const { data: srv } = await supabase.from('services').select('*');
    const { data: add } = await supabase.from('add_ons').select('*');
    
    console.log("Servicios cargados:", srv);
    console.log("Addons cargados:", add); // <-- Revisa esto en la consola
    
    setServices(srv || []);
    setAddons(add || []);
  };
  loadData();
}, []);
  useEffect(() => {
    if (selectedService) {
      supabase.from('service_schedules')
        .select('*')
        .eq('service_id', selectedService)
        .then(({ data }) => setSchedules(data || []));
    }
  }, [selectedService]);

  const updateAddonQty = (id, delta) => {
    setSelectedAddons(prev => {
      const currentQty = prev[id] || 0;
      const newQty = Math.max(0, currentQty + delta);
      return { ...prev, [id]: newQty };
    });
  };

  // CÁLCULO TOTAL
  const calculateTotal = () => {
    const servicePrice = services.find(s => s.id === selectedService)?.base_price_mxn || 0;
    const addonsTotal = Object.entries(selectedAddons).reduce((acc, [id, qty]) => {
      const addon = addons.find(a => a.id === id);
      return acc + (addon ? addon.price_mxn * qty : 0);
    }, 0);
    return servicePrice + addonsTotal;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total = calculateTotal();
    alert(`Procediendo al registro de reserva por $${total.toLocaleString()} MXN`);
    // Aquí irá la lógica de inserción que ya tenemos
  };

  // Helper para renderizar los items del "carrito" en el formulario
  const cartItems = Object.entries(selectedAddons)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const item = addons.find(a => a.id === id);
      return { ...item, qty };
    });

  return (
    <div className="min-h-screen bg-white font-sans text-[#1a2e4a]">
      <nav className="px-6 md:px-12 py-6 flex justify-between items-center border-b border-[#e2eff0] bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link to="/" className="text-xl md:text-2xl font-serif italic font-semibold">
          Rogues <span className="text-[#4ec6c6]">Yacht Co.</span>
        </Link>
        <Link to="/" className="text-sm font-semibold text-gray-400 hover:text-[#4ec6c6] transition">← REGRESAR</Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* INFO IZQUIERDA */}
          <div className="lg:col-span-7 space-y-10">
            <div className="rounded-[40px] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1567899378494-47b22a2bb96a?auto=format&fit=crop&q=80&w=1200" 
                alt="Yacht" className="w-full h-[500px] object-cover"
              />
            </div>
            <div>
              <h1 className="text-6xl font-serif mb-6">Tu experiencia, a tu medida.</h1>
              <p className="text-gray-500 text-xl leading-relaxed">Personaliza cada detalle de tu navegación. Desde el champagne más fino hasta la gastronomía local más fresca.</p>
            </div>
          </div>

          {/* FORMULARIO Y RESUMEN (DERECHA) */}
          <aside className="lg:col-span-5">
            <div className="bg-white border border-[#e2eff0] rounded-[48px] p-10 shadow-2xl shadow-blue-900/10 sticky top-32">
              <h2 className="text-2xl font-serif mb-8 border-b pb-4">Detalles de Reserva</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Inputs de contacto */}
                <input type="text" placeholder="Nombre completo" required className="w-full p-4 bg-[#f8fafb] border border-[#e2eff0] rounded-2xl" onChange={e => setFormData({...formData, name: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-4">
                  <input type="email" placeholder="Email" required className="w-full p-4 bg-[#f8fafb] border border-[#e2eff0] rounded-2xl text-sm" onChange={e => setFormData({...formData, email: e.target.value})} />
                  <input type="tel" placeholder="Teléfono" required className="w-full p-4 bg-[#f8fafb] border border-[#e2eff0] rounded-2xl text-sm" onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>

                {/* Yate y Horario */}
                <select required className="w-full p-4 bg-[#f8fafb] border border-[#e2eff0] rounded-2xl" onChange={e => setSelectedService(e.target.value)}>
                  <option value="">Selecciona tu embarcación</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} (${s.base_price_mxn.toLocaleString()})</option>)}
                </select>

                <div className="grid grid-cols-2 gap-4">
                  <input type="date" required className="w-full p-4 bg-[#f8fafb] border border-[#e2eff0] rounded-2xl text-sm" onChange={e => setFormData({...formData, date: e.target.value})} />
                  <select required className="w-full p-4 bg-[#f8fafb] border border-[#e2eff0] rounded-2xl text-sm" onChange={e => setFormData({...formData, time: e.target.value})}>
                    <option value="">Horario</option>
                    {schedules.map(h => <option key={h.id} value={h.start_time}>{h.label}</option>)}
                  </select>
                </div>

                {/* BOTÓN ADD-ONS */}
                <button 
                  type="button" 
                  onClick={() => setShowAmenities(true)}
                  className="w-full py-4 border-2 border-dashed border-[#4ec6c6] bg-[#f7fbfb] rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#4ec6c6]/5 transition"
                >
                  <span>✨</span> Personalizar Extras
                </button>

                {/* MINI CARRITO - Solo se ve si hay algo seleccionado */}
                {cartItems.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Extras añadidos</p>
                    {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.qty}x {item.name}</span>
                        <span className="font-semibold">${(item.price_mxn * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-6 border-t border-[#e2eff0]">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-gray-400 font-bold text-xs uppercase">Total Estimado</span>
                    <span className="text-4xl font-serif font-bold text-[#1a2e4a]">${calculateTotal().toLocaleString()} <span className="text-xs font-sans text-gray-400">MXN</span></span>
                  </div>
                  <button type="submit" className="w-full bg-[#1a2e4a] text-white py-6 rounded-full font-bold text-lg hover:bg-[#3ab5b5] transition-all shadow-xl">
                    Confirmar y Pagar
                  </button>
                </div>
              </form>
            </div>
          </aside>
        </div>
      </div>

      {/* MODAL DE CARRITO GOURMET */}
      {showAmenities && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#1a2e4a]/80 backdrop-blur-lg" onClick={() => setShowAmenities(false)}></div>
          <div className="relative bg-white w-full max-w-4xl rounded-[48px] p-10 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-serif mb-2">Signature Add-ons</h2>
              <p className="text-gray-400">Selecciona los complementos para tu viaje</p>
            </div>
            
            <div className="space-y-12">
              {/* SECCIÓN BEBIDAS */}
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#4ec6c6] mb-6 flex items-center gap-4">
                  <span>Bebidas & Cava</span>
                  <div className="h-px bg-[#4ec6c6]/20 flex-1"></div>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {addons.filter(a => a.category === 'bebida').map(a => (
                    <AddonCard key={a.id} addon={a} qty={selectedAddons[a.id] || 0} update={updateAddonQty} />
                  ))}
                </div>
              </div>

              {/* SECCIÓN ALIMENTOS */}
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#4ec6c6] mb-6 flex items-center gap-4">
                  <span>Menú Gourmet</span>
                  <div className="h-px bg-[#4ec6c6]/20 flex-1"></div>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {addons.filter(a => a.category === 'alimento').map(a => (
                    <AddonCard key={a.id} addon={a} qty={selectedAddons[a.id] || 0} update={updateAddonQty} />
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 mt-10 bg-white pt-6 border-t flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Subtotal Extras</p>
                <p className="text-2xl font-bold text-[#1a2e4a]">
                  ${Object.entries(selectedAddons).reduce((acc, [id, qty]) => acc + (addons.find(a => a.id === id)?.price_mxn || 0) * qty, 0).toLocaleString()} MXN
                </p>
              </div>
              <button 
                onClick={() => setShowAmenities(false)}
                className="bg-[#1a2e4a] text-white px-12 py-4 rounded-full font-bold hover:bg-[#4ec6c6] transition"
              >
                Guardar Selección
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-componente para las tarjetas del modal
function AddonCard({ addon, qty, update }) {
  return (
    <div className={`p-6 rounded-[32px] border transition-all ${qty > 0 ? 'border-[#4ec6c6] bg-[#4ec6c6]/5' : 'border-[#e2eff0] hover:border-gray-300'}`}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-3xl">{addon.category === 'bebida' ? '🍾' : '🍱'}</span>
        <span className="font-bold text-[#3ab5b5]">${addon.price_mxn.toLocaleString()}</span>
      </div>
      <h4 className="font-bold text-sm uppercase mb-1">{addon.name}</h4>
      <p className="text-xs text-gray-400 mb-6 line-clamp-2">{addon.description}</p>
      
      <div className="flex items-center justify-between bg-white rounded-full p-1 border border-[#e2eff0] shadow-sm">
        <button onClick={() => update(addon.id, -1)} className="w-8 h-8 flex items-center justify-center font-bold text-gray-400 hover:text-red-500">-</button>
        <span className="font-bold text-sm">{qty}</span>
        <button onClick={() => update(addon.id, 1)} className="w-8 h-8 flex items-center justify-center font-bold text-[#1a2e4a] hover:text-[#4ec6c6]">+</button>
      </div>
    </div>
  );
}