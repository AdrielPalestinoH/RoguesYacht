import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estado unificado para el formulario
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price_mxn: '',
    description: ''
  });

  const [editingId, setEditingId] = useState(null);

  // Cargar productos con sus categorías relacionadas
  const fetchItems = async () => {
    const { data } = await supabase
      .from('add_ons')
      .select(`
        *,
        addon_categories (
          name,
          emoji
        )
      `)
      .order('created_at', { ascending: false });
    setItems(data || []);
  };

  // Cargar categorías disponibles
 const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('addon_categories')
    .select('*')
    .order('name');
    
  if (error) {
    console.error("Error cargando categorías:", error);
  } else {
    console.log("Categorías cargadas:", data); // Agrega este log para depurar
    setCategories(data || []);
  }
};

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: '', category_id: '', price_mxn: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      category_id: item.category_id || '',
      price_mxn: item.price_mxn,
      description: item.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = { 
      name: formData.name, 
      category_id: formData.category_id || null, 
      price_mxn: parseFloat(formData.price_mxn),
      description: formData.description 
    };

    let error;
    if (editingId) {
      const result = await supabase
        .from('add_ons')
        .update(payload)
        .eq('id', editingId);
      error = result.error;
    } else {
      const result = await supabase
        .from('add_ons')
        .insert([payload]);
      error = result.error;
    }

    if (error) {
      alert("Error al procesar: " + error.message);
    } else {
      setIsModalOpen(false);
      fetchItems();
    }
    setIsSaving(false);
  };

  const deleteItem = async (id) => {
    if (confirm('¿Deseas eliminar este producto del menú?')) {
      const { error } = await supabase.from('add_ons').delete().eq('id', id);
      if (error) alert("Error al eliminar: " + error.message);
      fetchItems();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-[#1a2e4a]">Inventario de Extras</h1>
        <button 
          onClick={openCreateModal}
          className="bg-[#4ec6c6] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-[#3ab5b5] transition-all"
        >
          + Agregar Producto
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-5 text-xs font-black uppercase text-slate-400">Producto</th>
              <th className="p-5 text-xs font-black uppercase text-slate-400">Categoría</th>
              <th className="p-5 text-xs font-black uppercase text-slate-400">Precio</th>
              <th className="p-5 text-xs font-black uppercase text-slate-400 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition">
                <td className="p-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700">{item.name}</span>
                    <span className="text-xs text-slate-400 italic line-clamp-1">{item.description}</span>
                  </div>
                </td>
                <td className="p-5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-slate-100 text-slate-600">
                    {item.addon_categories?.emoji} {item.addon_categories?.name || 'Sin categoría'}
                  </span>
                </td>
                <td className="p-5 font-bold text-slate-600">${Number(item.price_mxn).toLocaleString()}</td>
                <td className="p-5 text-right space-x-3">
                  <button onClick={() => openEditModal(item)} className="text-[#4ec6c6] hover:text-[#1a2e4a] font-bold text-sm transition">Editar</button>
                  <button onClick={() => deleteItem(item.id)} className="text-red-300 hover:text-red-600 font-bold text-sm transition">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl">
            <h2 className="text-2xl font-serif mb-6 text-[#1a2e4a]">
              {editingId ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Nombre del Producto</label>
                <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#4ec6c6]" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Categoría</label>
    <select 
  required
  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl"
  value={formData.category_id}
  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
>
  <option value="">Seleccionar...</option>
  {categories.length > 0 ? (
    categories.map(cat => (
      <option key={cat.id} value={cat.id}>
        {cat.emoji} {cat.name}
      </option>
    ))
  ) : (
    <option disabled>No hay categorías creadas</option>
  )}
</select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Precio (MXN)</label>
                  <input required type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#4ec6c6]" 
                    value={formData.price_mxn} onChange={e => setFormData({...formData, price_mxn: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Descripción corta</label>
                <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none h-24 resize-none focus:ring-2 focus:ring-[#4ec6c6]" 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-[2] py-4 bg-[#1a2e4a] text-white font-bold rounded-2xl hover:bg-[#4ec6c6] transition shadow-lg disabled:bg-slate-300"
                >
                  {isSaving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}