import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'bebida',
    price_mxn: '',
    description: ''
  });

  const fetchItems = async () => {
    const { data } = await supabase
      .from('add_ons')
      .select('*')
      .order('created_at', { ascending: false });
    setItems(data || []);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('add_ons').insert([
      { 
        name: newItem.name, 
        category: newItem.category, 
        price_mxn: parseFloat(newItem.price_mxn),
        description: newItem.description 
      }
    ]);

    if (error) {
      alert("Error al guardar: " + error.message);
    } else {
      setIsModalOpen(false);
      setNewItem({ name: '', category: 'bebida', price_mxn: '', description: '' });
      fetchItems(); // Recargar lista
    }
  };

  const deleteItem = async (id) => {
    if (confirm('¿Deseas eliminar este producto del menú?')) {
      await supabase.from('add_ons').delete().eq('id', id);
      fetchItems();
    }
  };

  return (
    <div className="space-y-6">
      {/* Botón de Acción Superior */}
      <div className="flex justify-end">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#4ec6c6] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-[#3ab5b5] transition-all"
        >
          + Agregar Producto
        </button>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400">Producto</th>
              <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400">Categoría</th>
              <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400">Precio</th>
              <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition">
                <td className="p-5 text-slate-700 font-medium">
                  <div className="flex flex-col">
                    <span className="font-bold">{item.name}</span>
                    <span className="text-xs text-slate-400 italic">{item.description}</span>
                  </div>
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    item.category === 'bebida' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {item.category}
                  </span>
                </td>
                <td className="p-5 font-bold text-slate-600">${item.price_mxn.toLocaleString()}</td>
                <td className="p-5 text-right">
                  <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-600 font-bold text-sm transition">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CAPTURA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl">
            <h2 className="text-2xl font-serif mb-6 text-[#1a2e4a]">Nuevo Add-on</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Nombre</label>
                <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#4ec6c6]" 
                  value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Categoría</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                    value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                    <option value="bebida">Bebida</option>
                    <option value="alimento">Alimento</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Precio (MXN)</label>
                  <input required type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" 
                    value={newItem.price_mxn} onChange={e => setNewItem({...newItem, price_mxn: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Descripción</label>
                <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none h-24" 
                  value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-[#1a2e4a] text-white font-bold rounded-2xl hover:bg-[#4ec6c6] transition">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}