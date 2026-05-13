import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';

export default function ServicesManager() {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // NUEVO: Estado para los horarios de la tabla service_schedules
  const [schedules, setSchedules] = useState([]);

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').order('created_at');
    setServices(data || []);
  };

  // NUEVO: Carga los horarios de un servicio específico
  const fetchSchedules = async (serviceId) => {
    const { data, error } = await supabase
      .from('service_schedules')
      .select('*')
      .eq('service_id', serviceId);
    
    if (!error) {
      setSchedules(data || []);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleEditClick = (service) => {
    const serviceData = { ...service };
    
    if (typeof serviceData.inclusions === 'string') {
      try {
        serviceData.inclusions = JSON.parse(serviceData.inclusions);
      } catch (e) {
        serviceData.inclusions = serviceData.inclusions.split(',').map(i => i.trim());
      }
    }
    
    setEditingService(serviceData);
    fetchSchedules(service.id); // <--- Cargamos horarios al abrir
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Preparar Inclusiones
      const inclusionsArray = Array.isArray(editingService.inclusions)
        ? editingService.inclusions
        : editingService.inclusions.split(',').map(i => i.trim()).filter(i => i !== "");

      // 2. Datos del Servicio
      const serviceUpdate = {
        name: editingService.name,
        description: editingService.description,
        base_price_mxn: Number(editingService.base_price_mxn),
        duration_hours: Number(editingService.duration_hours),
        max_passengers: Number(editingService.max_passengers),
        emoji: editingService.emoji,
        is_recommended: Boolean(editingService.is_recommended),
        extra_info: editingService.extra_info,
        inclusions: inclusionsArray
      };

      const { error: serviceError } = await supabase
        .from('services')
        .update(serviceUpdate)
        .eq('id', editingService.id);

      if (serviceError) throw serviceError;

      // 3. Sincronizar Horarios (Borrar y Reinsertar)
      await supabase
        .from('service_schedules')
        .delete()
        .eq('service_id', editingService.id);

      if (schedules.length > 0) {
        const schedulesToInsert = schedules.map(s => ({
          service_id: editingService.id,
          start_time: s.start_time,
          label: s.label || "Diario",
          is_active: true
        }));

        const { error: schedError } = await supabase
          .from('service_schedules')
          .insert(schedulesToInsert);

        if (schedError) throw schedError;
      }

      setIsModalOpen(false);
      await fetchServices();
      alert("¡Yate y Horarios actualizados correctamente!");

    } catch (err) {
      console.error(err);
      alert("Error al sincronizar: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* GRID DE SERVICIOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200 relative overflow-hidden transition-all hover:shadow-md">
            {service.is_recommended && (
              <div className="absolute top-0 right-0 bg-[#4ec6c6] text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                Recomendado
              </div>
            )}
            <div className="text-4xl mb-4 bg-slate-50 w-16 h-16 flex items-center justify-center rounded-2xl">{service.emoji || '🛥️'}</div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">{service.name}</h3>
            <p className="text-slate-400 text-xs mb-4">{service.duration_hours}h • {service.max_passengers} personas</p>
            <div className="flex justify-between items-center border-t border-slate-50 pt-4">
              <span className="font-bold text-[#1a2e4a]">${Number(service.base_price_mxn).toLocaleString()} MXN</span>
              <button onClick={() => handleEditClick(service)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#4ec6c6] transition-all">
                Editar Detalle
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE EDICIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !isSaving && setIsModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-3xl rounded-[40px] p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <header className="mb-8">
              <h2 className="text-3xl font-serif text-[#1a2e4a]">Editar {editingService.name}</h2>
              <p className="text-slate-400 text-sm">Modifica los detalles técnicos y horarios.</p>
            </header>
            
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* COLUMNA IZQUIERDA */}
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Nombre y Emoji</label>
                  <div className="flex gap-3">
                    <input className="w-20 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl text-center" 
                      value={editingService.emoji} onChange={e => setEditingService({...editingService, emoji: e.target.value})} />
                    <input className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#1a2e4a]" 
                      value={editingService.name} onChange={e => setEditingService({...editingService, name: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Descripción</label>
                  <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-32 resize-none text-sm" 
                    value={editingService.description} onChange={e => setEditingService({...editingService, description: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Pax Máx</label>
                    <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" 
                      value={editingService.max_passengers} onChange={e => setEditingService({...editingService, max_passengers: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Horas</label>
                    <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" 
                      value={editingService.duration_hours} onChange={e => setEditingService({...editingService, duration_hours: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA */}
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Precio Base (MXN)</label>
                  <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#4ec6c6] text-xl" 
                    value={editingService.base_price_mxn} onChange={e => setEditingService({...editingService, base_price_mxn: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Inclusiones</label>
                  <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-32 resize-none text-xs" 
                    placeholder="Vino, Snorkel, Hielo..."
                    value={Array.isArray(editingService.inclusions) ? editingService.inclusions.join(', ') : editingService.inclusions} 
                    onChange={e => setEditingService({...editingService, inclusions: e.target.value})} />
                </div>

                <div>
                   <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Extra Info</label>
                   <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm" 
                    value={editingService.extra_info || ''} onChange={e => setEditingService({...editingService, extra_info: e.target.value})} />
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <input type="checkbox" className="w-6 h-6 accent-[#4ec6c6]" 
                    checked={editingService.is_recommended} onChange={e => setEditingService({...editingService, is_recommended: e.target.checked})} />
                  <span className="text-[10px] font-black uppercase text-slate-600">Destacar como Recomendado</span>
                </label>
              </div>

              {/* SECCIÓN DE HORARIOS (OCUPA TODO EL ANCHO) */}
              <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Gestión de Horarios</label>
                  <button type="button" onClick={() => setSchedules([...schedules, { start_time: "12:00", label: "Diario", is_active: true }])}
                    className="bg-[#4ec6c6]/10 text-[#4ec6c6] px-3 py-1 rounded-lg text-[10px] font-black uppercase">+ Añadir Bloque</button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {schedules.map((sched, index) => (
                    <div key={index} className="flex gap-3 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex-1">
                        <label className="text-[8px] font-bold text-slate-400 block uppercase">Día / Etiqueta</label>
                        <input className="bg-transparent text-sm font-bold text-slate-700 w-full focus:outline-none"
                          placeholder="Ej: Lunes" value={sched.label || ''}
                          onChange={(e) => {
                            const newScheds = [...schedules];
                            newScheds[index].label = e.target.value;
                            setSchedules(newScheds);
                          }} />
                      </div>
                      <div>
                        <label className="text-[8px] font-bold text-slate-400 block uppercase">Inicio</label>
                        <input type="time" className="bg-transparent text-sm font-bold text-slate-700 focus:outline-none"
                          value={sched.start_time}
                          onChange={(e) => {
                            const newScheds = [...schedules];
                            newScheds[index].start_time = e.target.value;
                            setSchedules(newScheds);
                          }} />
                      </div>
                      <button type="button" onClick={() => setSchedules(schedules.filter((_, i) => i !== index))} className="p-2 text-slate-300 hover:text-red-500">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* BOTONES ACCIÓN */}
              <div className="md:col-span-2 flex gap-4 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 text-slate-400 font-bold uppercase text-xs">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-[2] py-5 bg-[#1a2e4a] text-white font-bold rounded-3xl shadow-2xl hover:bg-[#4ec6c6] transition-all uppercase text-xs">
                  {isSaving ? "Sincronizando..." : "Confirmar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}