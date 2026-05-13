import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './api/supabase';

// Importaciones según tu estructura en image_5588bf.png
import LandingPage from './pages/Public/LandingPage';
import BookingForm from './pages/Public/BookingForm';
import Login from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';

import PrivacyPolicy from './PrivacyPolicy';


export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escuchar cambios (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null; // O un spinner elegante

  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/book" element={<BookingForm />} />
        
        {/* Auth */}
        <Route path="/admin/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />

        {/* Rutas Privadas (Admin) */}
        <Route 
          path="/dashboard" 
          element={session ? <Dashboard /> : <Navigate to="/login" />} 
        />
        
        {/* Ruta para Inventario (usando el Dashboard como base) */}
        <Route 
          path="/dashboard/inventory" 
          element={session ? <Dashboard view="inventory" /> : <Navigate to="/login" />} 
        />

        <Route 
  path="/dashboard/services" 
  element={session ? <Dashboard view="services" /> : <Navigate to="/login" />} 
/>

<Route path="/privacidad" element={<PrivacyPolicy />} />

<Route 
  path="/dashboard/reservations" 
  element={session ? <Dashboard view="reservations" /> : <Navigate to="/login" />} 
/>
      </Routes>
    </Router>
  );
}