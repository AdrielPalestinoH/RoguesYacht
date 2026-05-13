import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

useEffect(() => {
    const fetchServices = async () => {
      console.log("Intentando conectar a:", import.meta.env.VITE_SUPABASE_URL); // Verifica si lee el .env
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('base_price_mxn', { ascending: true });
      
      if (error) {
        console.error("Error de Supabase:", error.message);
      } else {
        console.log("Datos recibidos:", data); // Esto debería mostrar el array de servicios
        setServices(data);
      }
      setLoading(false);
    };
    fetchServices();
  }, []);

  const handleReserve = () => {
    navigate('/book'); 
  };

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
        
        body { overflow-x: hidden; }

        .landing-wrapper { 
          font-family: 'Inter', sans-serif; 
          color: var(--navy); 
          line-height: 1.5;
          width: 100%;
        }

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
          min-height: 100vh;
          background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('/fondo.jpg');
          background-size: cover; background-position: center; background-attachment: fixed;
          display: flex; align-items: center; justify-content: center; text-align: center;
          color: #fff; padding: 0 20px;
        }
        .hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(45px, 7vw, 80px); margin-bottom: 20px; }
        .hero h1 em { color: var(--teal); font-style: italic; }

        /* SECCIONES */
        section { padding: 100px 20px; width: 100%; }
        .container { max-width: 1200px; margin: 0 auto; }

        /* GRID DE TARJETAS */
        .packages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 30px; margin-top: 60px;
        }

        .pkg-card {
          background: var(--white); border-radius: 24px; overflow: hidden;
          box-shadow: 0 15px 35px rgba(26,46,74,0.1); border: 1px solid #e2eff0;
          display: flex; flex-direction: column; position: relative;
          transition: transform 0.3s ease;
        }
        .pkg-card:hover { transform: translateY(-10px); }

        /* Estilo Cabecera (Azul como la imagen) */
        .pkg-header { 
          padding: 40px 30px 30px; 
          background: var(--navy); 
          color: var(--white); 
          text-align: left;
        }
        .pkg-name { font-family: 'Playfair Display', serif; font-size: 26px; margin-bottom: 10px; }
        .pkg-desc { font-size: 13px; opacity: 0.85; line-height: 1.4; }

        /* Precio */
        .pkg-price { padding: 25px 30px; background: #f8fcfc; border-bottom: 1px solid #eef6f6; }
        .pkg-amount { font-size: 32px; font-weight: 700; color: var(--navy); }
        .pkg-per { font-size: 13px; color: var(--gray); font-weight: 500; }

        /* Cuerpo / Inclusiones */
        .pkg-body { padding: 30px; flex-grow: 1; display: flex; flex-direction: column; }
        .pkg-features { list-style: none; margin-bottom: 30px; flex-grow: 1; }
        .pkg-features li { 
          margin-bottom: 12px; font-size: 14px; color: var(--navy); 
          display: flex; align-items: center; gap: 10px; 
        }
        .check-icon { color: var(--teal); font-weight: bold; }

        .pkg-btn {
          width: 100%; padding: 15px; border-radius: 50px; 
          border: 2px solid var(--navy); background: transparent; 
          color: var(--navy); font-weight: 700; cursor: pointer; transition: 0.3s;
        }
        .pkg-btn.recommended { background: var(--navy); color: white; }
        .pkg-btn:hover { background: var(--teal); border-color: var(--teal); color: white; }

        .badge {
          position: absolute; top: 20px; right: 20px; 
          background: var(--teal); color: white; padding: 5px 12px; 
          border-radius: 6px; font-size: 10px; font-weight: 800; letter-spacing: 0.5px;
        }

        footer { background: #0a1929; padding: 80px 20px; color: #fff; text-align: center; }
      `}</style>

      {/* NAVEGACIÓN */}
      <nav>
        <div className="nav-logo-container">
          <img src="/logo.jpg" alt="Logo" className="nav-logo-img" />
        </div>
        <ul className="nav-links">
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#paquetes">Paquetes</a></li>
          <li><a href="#experiencias">Experiencias</a></li>
        </ul>
        <button onClick={handleReserve} className="nav-cta">Reservar ahora</button>
      </nav>

      {/* HERO */}
      <section className="hero" id="inicio">
        <div className="hero-content">
          <h1>Navega hacia lo <em>extraordinario</em></h1>
          <p style={{fontSize:'19px', marginBottom:'35px', opacity: 0.9}}>Yates de lujo y destinos exclusivos en el paraíso.</p>
          <button 
            onClick={() => document.getElementById('paquetes').scrollIntoView({behavior:'smooth'})}
            style={{background:'var(--teal)', border:'none', padding:'16px 38px', borderRadius:'50px', color:'white', fontWeight:'bold', cursor:'pointer'}}
          >
            Explorar Paquetes
          </button>
        </div>
      </section>

      {/* PAQUETES DINÁMICOS */}
      <section id="paquetes" style={{background: '#fff'}}>
        <div className="container">
          <div style={{textAlign:'center'}}>
            <h2 className="playfair" style={{fontSize:'42px'}}>Nuestros Paquetes</h2>
            <div style={{width:'50px', height:'3px', background:'var(--teal)', margin:'15px auto'}}></div>
          </div>

          <div className="packages-grid">
            {loading ? (
              <p style={{textAlign:'center', gridColumn:'1/-1'}}>Cargando flota...</p>
            ) : (
              services.map((service) => (
                <div key={service.id} className="pkg-card">
                  {/* Badge Recomendado */}
                  {service.is_recommended && <div className="badge">RECOMENDADO</div>}

                  {/* Encabezado Azul */}
                  <div className="pkg-header">
                    <div style={{fontSize:'32px', marginBottom:'15px'}}>{service.emoji}</div>
                    <h3 className="pkg-name">{service.name}</h3>
                    <p className="pkg-desc">{service.description}</p>
                  </div>

                  {/* Precio y Horario */}
                  <div className="pkg-price">
                    <div style={{display:'flex', alignItems:'baseline', gap:'8px'}}>
                      <span className="pkg-amount">${service.base_price_mxn?.toLocaleString()}</span>
                      <span className="pkg-per">
                        MXN / {service.duration_hours} {service.duration_hours === 1 ? 'hora' : 'horas'}
                      </span>
                    </div>
                    {service.extra_info && (
                      <div style={{fontSize:'12px', color:'var(--teal)', fontWeight:'600', marginTop:'5px'}}>
                        {service.extra_info}
                      </div>
                    )}
                  </div>

                  {/* Inclusiones y Botón */}
                  <div className="pkg-body">
                    <ul className="pkg-features">
                      {/* Capacidad fija desde la columna max_passengers */}
                      <li><span className="check-icon">✓</span> Capacidad: {service.max_passengers} pasajeros</li>
                      
                      {/* Mapeo de inclusiones dinámicas */}
                      {service.inclusions?.map((inc, i) => (
                        <li key={i}><span className="check-icon">✓</span> {inc}</li>
                      ))}
                    </ul>

                    <button 
                      onClick={handleReserve} 
                      className={`pkg-btn ${service.is_recommended ? 'recommended' : ''}`}
                    >
                      {service.is_recommended ? 'Reservar experiencia' : 'Reservar ahora'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <p className="playfair" style={{fontSize:'26px', color:'#fff', marginBottom:'15px'}}>Rogues Yacht Co.</p>
          <p style={{opacity: 0.5, fontSize: '13px'}}>© 2026 Todos los derechos reservados. Lujo y exclusividad en el mar.</p>
        </div>
      </footer>
    </div>
  );
}