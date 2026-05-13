export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-10 bg-white rounded-[40px] shadow-sm my-10 border border-slate-100">
      <h1 className="text-4xl font-serif text-[#1a2e4a] mb-6">Aviso de Privacidad</h1>
      <p className="text-slate-500 mb-8 italic text-sm">Última actualización: Mayo 2026</p>
      
      <div className="space-y-8 text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-[#1a2e4a] mb-3 uppercase tracking-widest text-[12px]">1. Datos del Responsable</h2>
          <p>En [Tu Marca], nos tomamos muy en serio la seguridad de su información...</p>
        </section>

        <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
          <h2 className="text-xl font-bold text-[#1a2e4a] mb-3 uppercase tracking-widest text-[12px]">2. Información Recabada</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li>Nombres y Apellidos</li>
            <li>Correo Electrónico</li>
            <li>Teléfono de contacto</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-[#1a2e4a] mb-3 uppercase tracking-widest text-[12px]">3. Procesamiento de Pagos</h2>
          <p>Toda transacción monetaria es procesada por <strong>Stripe</strong>. Nosotros no tenemos acceso a la información sensible de sus métodos de pago.</p>
        </section>
      </div>
    </div>
  );
}