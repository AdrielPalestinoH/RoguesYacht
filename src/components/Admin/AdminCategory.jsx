import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('✨');

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data } = await supabase.from('addon_categories').select('*').order('name');
    setCategories(data || []);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName) return;
    
    const { error } = await supabase
      .from('addon_categories')
      .insert([{ name: newName, emoji: newEmoji }]);
    
    if (error) alert("Error al crear: " + error.message);
    else {
      setNewName('');
      fetchCategories();
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar categoría? Los productos asociados quedarán sin categoría.")) return;
    await supabase.from('addon_categories').delete().eq('id', id);
    fetchCategories();
  }

  return (
    <div className="p-8 bg-white rounded-[32px] shadow-sm border border-[#e2eff0]">
      <h2 className="text-2xl font-serif mb-6">Gestionar Categorías</h2>

      {/* Formulario de Creación */}
      <form onSubmit={handleCreate} className="flex gap-4 mb-8 bg-[#f8fafb] p-6 rounded-2xl">
        <input 
          className="flex-1 p-3 rounded-xl border border-[#e2eff0]"
          placeholder="Nombre: ej. Vinos Tintos"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input 
          className="w-20 p-3 rounded-xl border border-[#e2eff0] text-center"
          placeholder="Icono"
          value={newEmoji}
          onChange={(e) => setNewEmoji(e.target.value)}
        />
        <button className="bg-[#4ec6c6] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1a2e4a] transition-colors">
          + Agregar
        </button>
      </form>

      {/* Lista de Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between p-4 border border-[#e2eff0] rounded-2xl hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <span className="text-2xl bg-gray-50 p-2 rounded-lg">{cat.emoji}</span>
              <span className="font-bold text-[#1a2e4a]">{cat.name}</span>
            </div>
            <button 
              onClick={() => handleDelete(cat.id)}
              className="text-red-400 hover:text-red-600 p-2"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}