import React from 'react';
import NavbarCliente from '../../components/NavbarCliente';
import backgroundImage from '../../assets/images/restaurante-fondo.jpg';
import valuesImage from '../../assets/images/valores.jpg';       // Imagen para valores
import teamImage from '../../assets/images/equipo.jpg';          // Imagen del equipo
import comidaImage from '../../assets/images/comida-destacada.jpg'; // Imagen comida destacada

function AboutUs() {
  return (
    <div className="about-container">
      <NavbarCliente />

      {/* Sección Hero */}
      <section
        className="hero-section"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(${backgroundImage})`
        }}
      >
        <div className="hero-overlay">
          <h1 className="hero-title">Acerca de Nosotros</h1>
        </div>
      </section>

      {/* Sección de Contenido */}
      <section className="about-content">
        <div className="section history">
          <h2>Nuestra Historia</h2>
          <p>
            Fundado en 2002, El Gusto de Don Justo comenzó como un pequeño local familiar, con la idea de compartir la pasión por la auténtica comida argentina. Con los años, nos hemos convertido en un referente gastronómico donde cada plato cuenta una historia de tradición, dedicación y amor por la buena comida.
          </p>
          <img src={teamImage} alt="Nuestro equipo" style={{width: '100%', borderRadius: '12px', marginTop: '1rem'}} />
        </div>

      <div className="section mission">
          <h2>Nuestra Misión</h2>
          <p>
            Nuestra misión es brindar experiencias culinarias inolvidables, utilizando ingredientes frescos y locales para crear platos únicos que despiertan los sentidos. Nos esforzamos por ofrecer un ambiente acogedor y un servicio excepcional en cada visita.
          </p>
          <div style={{ marginTop: '1rem' }}>
            <img
              src={comidaImage}
              alt="Sopa de Maní"
              style={{ width: '100%', borderRadius: '12px' }}
            />
            <p style={{ textAlign: 'center', fontStyle: 'italic', marginTop: '0.5rem', color: '#555' }}>
              La tradicional Sopa de Maní, un plato emblemático de nuestra cocina.
            </p>
          </div>
        </div>


        {/* Añadido texto e imagen para la sección de valores */}
        <div className="section values">
          <h2>Nuestros Valores</h2>
          <p>
            En El Gusto de Don Justo, creemos que el éxito se basa en la calidad, la pasión y el compromiso con nuestros clientes y la comunidad. Nuestros valores nos guían en cada decisión y acción que tomamos.
          </p>
          <img src={valuesImage} alt="Valores del restaurante" style={{width: '100%', borderRadius: '12px', marginTop: '1rem'}} />
        </div>

        <div className="section video">
          <h2>Conoce Más</h2>
          <p>
            Te invitamos a visitarnos para poder disfrutar de una experiencia gastronómica única. Y conocer de primera mano la comida que nos ha hecho famosos.
          </p>
        </div>
      </section>

      <style>{`
        :root {
          --primary-color: #8B0000;       /* Rojo vino tinto */
          --secondary-color: #D4AF37;     /* Dorado */
          --accent-color: #3D2B1F;        /* Marrón chocolate */
          --light-bg: #FFF8F0;            /* Beige claro */
          --dark-bg: #2A2A2A;
          --text-dark: #333;
          --text-light: #FFF;
          --section-spacing: 6rem 0;
          --border-radius: 12px;
          --box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Playfair Display', serif;
          background: var(--light-bg);
          color: var(--text-dark);
          line-height: 1.6;
        }

        .about-container {
          background-color: var(--light-bg);
        }

        /* Hero Section */
        .hero-section {
          min-height: 50vh;
          background-size: cover;
          background-position: center;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-overlay {
          background: rgba(0, 0, 0, 0.5);
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .hero-title {
          font-size: 3.5rem;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 3px;
        }

        /* About Content Section */
        .about-content {
          max-width: 1200px;
          width: 90%;
          margin: 3rem auto;
          padding: 2rem;
        }
        .section {
          margin-bottom: var(--section-spacing);
        }
        .section h2 {
          font-size: 2.5rem;
          color: var(--primary-color);
          text-align: center;
          margin-bottom: 1rem;
          position: relative;
        }
        .section h2::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 3px;
          background: var(--secondary-color);
          border-radius: 2px;
        }
        .section p {
          font-size: 1.1rem;
          line-height: 1.8;
          text-align: justify;
          margin: 0 auto;
          max-width: 800px;
        }

        /* Video Section */
        .video {
          text-align: center;
        }
        .video-wrapper {
          position: relative;
          width: 100%;
          padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
          height: 0;
          margin-top: 2rem;
          border-radius: var(--border-radius);
          box-shadow: var(--box-shadow);
          overflow: hidden;
        }
        .video-wrapper video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          .section h2 {
            font-size: 2rem;
          }
          .section p {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default AboutUs;
