import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';

export default function ServicesManager() {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error("Error al traer servicios:", error);
    } else {
      setServices(data || []);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEditClick = (service) => {
    const serviceData = { ...service };
    // Aseguramos que las inclusiones sean un array para el formulario
    if (typeof serviceData.inclusions === 'string') {
      try {
        serviceData.inclusions = JSON.parse(serviceData.inclusions);
      } catch (e) {
        serviceData.inclusions = serviceData.inclusions.split(',').map(i => i.trim());
      }
    }
    setEditingService(serviceData);
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Preparar inclusiones (Array de strings limpio)
      const inclusionsArray = Array.isArray(editingService.inclusions)
        ? editingService.inclusions
        : editingService.inclusions.split(',').map(i => i.trim()).filter(i => i !== "");

      // 2. Construir objeto de actualización exacto (sin campos extra como created_at)
      const dataToUpdate = {
        name: editingService.name,
        description: editingService.description,
        base_price_mxn: parseFloat(editingService.base_price_mxn) || 0,
        duration_hours: parseInt(editingService.duration_hours) || 0,
        max_passengers: parseInt(editingService.max_passengers) || 0,
        emoji: editingService.emoji,
        is_recommended: editingService.is_recommended,
        extra_info: editingService.extra_info,
        inclusions: inclusionsArray // Supabase acepta arrays de JS para columnas JSONB o Text[]
      };

      const { error } = await supabase
        .from('services')
        .update(dataToUpdate)
        .eq('id', editingService.id.trim());

      if (error) throw error;

      // Éxito:
      setIsModalOpen(false);
      setServices([]); // Limpieza rápida para forzar render
      await fetchServices();
      alert("¡Yate actualizado correctamente!");

    } catch (error) {
      console.error("Error completo:", error);
      alert("Error al guardar: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Grid de Servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200 relative overflow-hidden transition-all hover:shadow-md">
            {service.is_recommended && (
              <div className="absolute top-0 right-0 bg-[#4ec6c6] text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                Recomendado
              </div>
            )}
            
            <div className="text-4xl mb-4 bg-slate-50 w-16 h-16 flex items-center justify-center rounded-2xl">
              {service.emoji || '🛥️'}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">{service.name}</h3>
            <p className="text-slate-400 text-xs mb-4">
              {service.duration_hours}h • Hasta {service.max_passengers} pasajeros
            </p>
            
            <div className="flex justify-between items-center border-t border-slate-50 pt-4">
              <span className="font-bold text-[#1a2e4a]">
                ${service.base_price_mxn?.toLocaleString()} <span className="text-[10px] opacity-50">MXN</span>
              </span>
              <button 
                onClick={() => handleEditClick(service)}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#4ec6c6] transition-all"
              >
                Editar Detalle
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !isSaving && setIsModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-2xl rounded-[40px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-[#1a2e4a]">Configurar Experiencia</h2>
              <span className="text-4xl">{editingService.emoji}</span>
            </div>
            
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna Izquierda */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Nombre y Emoji</label>
                  <div className="flex gap-2">
                    <input className="w-16 p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl" 
                      value={editingService.emoji} onChange={e => setEditingService({...editingService, emoji: e.target.value})} />
                    <input className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" 
                      value={editingService.name} onChange={e => setEditingService({...editingService, name: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Descripción</label>
                  <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-24 resize-none text-sm leading-relaxed" 
                    value={editingService.description} onChange={e => setEditingService({...editingService, description: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Pasajeros Máx.</label>
                    <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" 
                      value={editingService.max_passengers} onChange={e => setEditingService({...editingService, max_passengers: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Horas Base</label>
                    <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" 
                      value={editingService.duration_hours} onChange={e => setEditingService({...editingService, duration_hours: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Precio Base (MXN)</label>
                  <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-600 text-lg" 
                    value={editingService.base_price_mxn} onChange={e => setEditingService({...editingService, base_price_mxn: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Inclusiones (Separar por comas)</label>
                  <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-24 resize-none text-xs" 
                    value={Array.isArray(editingService.inclusions) ? editingService.inclusions.join(', ') : editingService.inclusions} 
                    onChange={e => setEditingService({...editingService, inclusions: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Info Adicional (Ej: Horarios)</label>
                  <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                    value={editingService.extra_info || ''} onChange={e => setEditingService({...editingService, extra_info: e.target.value})} />
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                  <input type="checkbox" className="w-5 h-5 accent-[#4ec6c6]" 
                    checked={editingService.is_recommended} onChange={e => setEditingService({...editingService, is_recommended: e.target.checked})} />
                  <span className="text-xs font-black uppercase text-slate-600">Destacar como Recomendado</span>
                </label>
              </div>

              {/* Botones de Acción */}
              <div className="md:col-span-2 flex gap-4 mt-6">
                <button 
                  type="button" 
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-[2] py-4 bg-[#1a2e4a] text-white font-bold rounded-2xl shadow-xl shadow-blue-900/20 hover:bg-slate-800 transition-all disabled:bg-slate-400"
                >
                  {isSaving ? "Guardando cambios..." : "Actualizar Servicio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}