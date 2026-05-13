import { useState } from 'react';
import Sidebar from '../../components/Admin/Sidebar';
import ReservationsTable from '../../components/Admin/ReservationsTable';
import Inventory from '../../components/Admin/Inventory'; 
import ServicesManager from '../../components/Admin/ServicesManager';

export default function Dashboard({ view = 'stats' }) {
  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />
      
      <main className="ml-64 p-8 w-full">
        {/* VISTA: ESTADÍSTICAS / INICIO */}
        {view === 'stats' && (
          <>
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-slate-800">Panel de Control</h1>
              <p className="text-slate-500">Estado actual de Rogue Yachts</p>
            </header>
            <ReservationsTable />
          </>
        )}

        {/* VISTA: INVENTARIO (ADD-ONS) */}
        {view === 'inventory' && (
          <>
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-slate-800">Inventario de Add-ons</h1>
              <p className="text-slate-500">Gestiona bebidas y alimentos</p>
            </header>
            <Inventory />
          </>
        )}

        {/* VISTA: SERVICIOS (YATES) */}
        {view === 'services' && (
          <>
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-slate-800">Gestión de Servicios</h1>
              <p className="text-slate-500">Administra tus yates y paquetes principales</p>
            </header>
            <ServicesManager />
          </>
        )}
      </main>
    </div>
  );
}