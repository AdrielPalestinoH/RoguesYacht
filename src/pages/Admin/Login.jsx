import { useState } from 'react';
import { supabase } from '../../api/supabase';
import { useNavigate } from 'react-router-dom'; // <--- 1. IMPORTAR

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // <--- 2. INICIALIZAR

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Limpiamos cualquier sesión previa por seguridad
    await supabase.auth.signOut();

    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) {
      alert('Error: ' + error.message);
    } else {
      console.log('Usuario autenticado:', data.user);
      alert('¡Bienvenido, Rogue Admin!');
      navigate('/dashboard'); // Ahora sí funcionará
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: 'auto', color: '#1a2e4a' }}>
      <h1>Admin Login</h1>
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ display: 'block', width: '100%', marginBottom: '20px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#1a2e4a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Entrar al Panel
        </button>
      </form>
    </div>
  );
}