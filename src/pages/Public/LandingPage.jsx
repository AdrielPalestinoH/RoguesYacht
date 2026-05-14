import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [vessels, setVessels] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const { data: vslData } = await supabase.from('vessels').select('*').order('name', { ascending: true });
        setVessels(vslData || []);
        if (vslData?.length > 0) setSelectedVessel(vslData[0].id);

        const { data: srvData } = await supabase.from('services').select('*').order('base_price_mxn', { ascending: true });
        setServices(srvData || []);
      } catch (error) {
        console.error("Error:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const filteredServices = services.filter(s => s.vessel_id === selectedVessel);

  return (
    <div className="landing-wrapper">
      <style>{`
        :root {
          --navy: #1a2e4a;
          --teal: #4ec6c6;
          --light: #f7fbfb;
          --white: #fff;
          --gray: #64748b;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; font-family: 'Inter', sans-serif; color: var(--navy); }
        .playfair { font-family: 'Playfair Display', serif; }

        /* NAV */
        nav {
          position: fixed; top: 0; left: 0; right: 0; width: 100%; z-index: 1000;
          background: rgba(255,255,255,0.98); backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(26,46,74,0.08);
          padding: 12px 40px; display: flex; align-items: center; justify-content: space-between;
        }
        .nav-logo-img { height: 45px; width: auto; }
        .nav-links { display: flex; gap: 30px; list-style: none; }
        .nav-links a { text-decoration: none; font-size: 14px; font-weight: 500; color: var(--navy); }
        .nav-cta { 
          background: var(--navy); color: #fff; padding: 10px 22px; 
          border-radius: 50px; font-size: 13px; border: none; cursor: pointer; 
        }

        /* HERO */
        .hero {
          min-height: 80vh;
          background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('/fondo.jpg');
          background-size: cover; background-position: center;
          display: flex; align-items: center; justify-content: center; text-align: center; color: #fff;
        }

        /* SECCIÓN SELECCIÓN BARCO (DISEÑO IMAGEN) */
        .vessel-selection-section { padding: 80px 20px; background: #fff; text-align: center; }
        .vessel-grid { 
          display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); 
          gap: 30px; max-width: 1200px; margin: 40px auto 0; 
        }
        .vessel-main-card {
          background: #fff; border-radius: 20px; overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #eee;
          transition: transform 0.3s ease, border-color 0.3s;
          text-align: left; position: relative;
        }
        .vessel-main-card.active { border-color: var(--teal); border-width: 2px; }
        .vessel-img-header { height: 280px; background-size: cover; background-position: center; }
        .vessel-content { padding: 30px; }
        .vessel-title { font-size: 32px; margin-bottom: 5px; color: var(--navy); }
        .vessel-tagline { color: var(--teal); font-size: 14px; margin-bottom: 20px; font-weight: 600; }
        
        .vessel-specs { display: flex; justify-content: space-between; margin-bottom: 25px; border-bottom: 1px solid #f0f0f0; padding-bottom: 20px; }
        .spec-item { text-align: center; flex: 1; }
        .spec-label { display: block; font-size: 11px; color: var(--gray); margin-top: 5px; text-transform: uppercase; }
        .spec-value { font-size: 13px; font-weight: 600; }

        .vessel-features-list { list-style: none; margin-bottom: 25px; }
        .vessel-features-list li { font-size: 13px; color: var(--gray); margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
        .vessel-features-list li::before { content: '✓'; color: var(--teal); font-weight: bold; }

        .vessel-action-btn {
          width: 100%; padding: 15px; border-radius: 50px; background: var(--navy);
          color: white; border: none; font-weight: bold; cursor: pointer;
          display: flex; justify-content: center; align-items: center; gap: 10px; transition: 0.3s;
        }
        .vessel-action-btn:hover { background: var(--teal); }

        /* PAQUETES (GRID ABAJO) */
        .packages-section { padding: 80px 20px; background: var(--light); }
        .packages-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto; }
        .pkg-card { background: var(--white); border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(26,46,74,0.1); display: flex; flex-direction: column; }
        .pkg-header { padding: 40px 30px 30px; background: var(--navy); color: var(--white); }
        .pkg-price { padding: 25px 30px; background: #f8fcfc; border-bottom: 1px solid #eef6f6; }
        .pkg-amount { font-size: 32px; font-weight: 700; color: var(--navy); }
        .pkg-body { padding: 30px; flex-grow: 1; }
        .pkg-btn { width: 100%; padding: 15px; border-radius: 50px; border: 2px solid var(--navy); background: transparent; color: var(--navy); font-weight: 700; cursor: pointer; transition: 0.3s; }
        .pkg-btn.recommended { background: var(--navy); color: white; }
      `}</style>

      <nav>
        <img src="/logo.jpg" alt="Logo" className="nav-logo-img" />
        <ul className="nav-links">
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#vessels">Nuestra Flota</a></li>
          <li><a href="#experiencias">Experiencias</a></li>
        </ul>
        <button onClick={() => navigate('/book')} className="nav-cta">Reservar ahora</button>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1 className="playfair" style={{fontSize: 'clamp(45px, 7vw, 80px)'}}>Navega hacia lo <em>extraordinario</em></h1>
          <p style={{fontSize:'19px', marginBottom:'35px', opacity: 0.9}}>Yates de lujo y destinos exclusivos en el paraíso.</p>
        </div>
      </section>

      {/* SECCIÓN DE SELECCIÓN DE BARCO - DISEÑO IMAGE_BF2551 */}
<section className="vessel-selection-section" id="vessels">
  <span style={{color: 'var(--teal)', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px'}}>
    PRIMERO, ELIGE TU EMBARCACIÓN
  </span>
  <h2 className="playfair" style={{fontSize: '42px', marginTop: '10px'}}>
    Selecciona tu embarcación
  </h2>
  
  {/* LÍNEA CORREGIDA ABAJO: 'var(--gray)' con comillas */}
  <p style={{maxWidth: '700px', margin: '20px auto', color: 'var(--gray)'}}>
    Cada embarcación tiene su propio estilo y personalidad. Elige la que mejor se adapte a tu plan y descubre las experiencias diseñadas para ti.
  </p>

  <div className="vessel-grid">
    {vessels.map(v => {
      const isSeaRay = v.name.toLowerCase().includes('sea');
      return (
        <div key={v.id} className={`vessel-main-card ${selectedVessel === v.id ? 'active' : ''}`}>
          <div className="vessel-img-header" style={{backgroundImage: `url(${isSeaRay ? '/b.png' : '/a.png'})`}}></div>
          <div className="vessel-content">
            <h3 className="vessel-title playfair">{v.name}</h3>
            <p className="vessel-tagline">{isSeaRay ? 'Lujo, confort y elegancia en cada detalle.' : 'Diversión, espacio y el plan perfecto para compartir.'}</p>
            
            <div className="vessel-specs">
              <div className="spec-item">
                <span className="spec-value">1-{isSeaRay ? '12' : '14'}</span>
                <span className="spec-label">Capacidad</span>
              </div>
              <div className="spec-item">
                <span className="spec-value">{isSeaRay ? 'Premium' : 'Relax & Fun'}</span>
                <span className="spec-label">Experiencia</span>
              </div>
              <div className="spec-item">
                <span className="spec-value">{isSeaRay ? 'Especial' : 'Grupos'}</span>
                <span className="spec-label">Ideal para</span>
              </div>
            </div>

            <ul className="vessel-features-list">
              <li>{isSeaRay ? 'Interiores espaciosos y cómodos' : 'Amplio espacio en cubierta'}</li>
              <li>{isSeaRay ? 'Acabados de lujo' : 'Ideal para snorkel y actividades'}</li>
              <li>{isSeaRay ? 'Perfecta para atardeceres románticos' : 'Perfecta para tours, sunset y diversión'}</li>
            </ul>

            <button className="vessel-action-btn" onClick={() => {
              setSelectedVessel(v.id);
              document.getElementById('experiencias').scrollIntoView({behavior:'smooth'});
            }}>
              Ver experiencias {v.name} →
            </button>
          </div>
        </div>
      );
    })}
  </div>
</section>

      {/* SECCIÓN DE PAQUETES FILTRADOS */}
      <section className="packages-section" id="experiencias">
        <div style={{textAlign:'center', marginBottom: '50px'}}>
          <h2 className="playfair" style={{fontSize: '36px'}}>Experiencias Disponibles</h2>
          <p style={{color: 'var(--gray)'}}>Mostrando paquetes para: <strong>{vessels.find(v => v.id === selectedVessel)?.name}</strong></p>
        </div>

        <div className="packages-grid">
          {!loading && filteredServices.map((service) => (
            <div key={service.id} className="pkg-card">
              {service.is_recommended && <div className="badge">RECOMENDADO</div>}
              <div className="pkg-header">
                <div style={{fontSize:'32px', marginBottom:'15px'}}>{service.emoji || '⚓'}</div>
                <h3 className="pkg-name playfair">{service.name}</h3>
                <p className="pkg-desc">{service.description}</p>
              </div>
              <div className="pkg-price">
                <span className="pkg-amount">${service.base_price_mxn?.toLocaleString()}</span>
                <span className="pkg-per"> MXN / {service.duration_hours}h</span>
              </div>
              <div className="pkg-body">
                <ul className="pkg-features" style={{listStyle:'none', marginBottom:'30px'}}>
                  <li style={{fontSize:'14px', marginBottom:'10px'}}>✓ Capacidad: {service.max_passengers} pasajeros</li>
                  {service.inclusions?.map((inc, i) => (
                    <li key={i} style={{fontSize:'14px', marginBottom:'10px'}}>✓ {inc}</li>
                  ))}
                </ul>
                <button onClick={() => navigate('/book')} className={`pkg-btn ${service.is_recommended ? 'recommended' : ''}`}>
                  Reservar ahora
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <p style={{opacity: 0.6, fontSize: '14px'}}>© 2026 Rogue Yacht Co. Experiencias privadas de lujo.</p>
      </footer>
    </div>
  );
}