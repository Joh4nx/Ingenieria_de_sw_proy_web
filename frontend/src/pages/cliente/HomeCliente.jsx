// src/pages/cliente/HomeCliente.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavbarCliente from '../../components/NavbarCliente';
import backgroundImage from '../../assets/images/restaurante-fondo.jpg';
import dishPlaceholder from '../../assets/images/placeholder-dish.jpg';
import Slider from 'react-slick';
import { FiClock, FiMapPin, FiPhone, FiStar, FiArrowRight } from 'react-icons/fi';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import LazyLoad from 'react-lazyload';
import Footer from '../../components/Footer';

// Importar estilos de react-slick
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function HomeCliente() {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleMap = () => {
    setIsMapOpen(!isMapOpen);
  };
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const fetchDishes = async () => {
      try {
        const response = await fetch('http://localhost:3001/menu', { signal });
        if (!response.ok) throw new Error('Error en la respuesta del servidor');
        const data = await response.json();
        const platosArray = data ? Object.values(data) : [];
        const mappedDishes = platosArray.map(dish => ({
          id: dish.id || dish.key,
          name: dish.nombre,
          price: dish.precio,
          description: dish.descripcion,
          image: dish.imagen || dishPlaceholder,
          category: dish.categoria || 'Especialidad'
        }));
        setFeaturedDishes(mappedDishes);
        setLoading(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error al cargar platos destacados:', err);
          setError(err.message);
          setLoading(false);
        }
      }
    };
    fetchDishes();
    return () => controller.abort();
  }, []);

  // Configuración del slider: se muestran 2 platos por slide
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    cssEase: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1, arrows: false } }
    ]
  };

  const testimonials = [
    {
      id: 1,
      author: 'Juan Pérez',
      text: 'La mejor experiencia gastronómica de la ciudad. ¡Imperdible!',
      avatar: '/images/avatar1.jpg'
    },
    {
      id: 2,
      author: 'María Gómez',
      text: 'Sabores auténticos y atención de primera calidad.',
      avatar: '/images/avatar2.jpg'
    }
  ];

  // Activar animaciones al hacer scroll (usando Intersection Observer)
  useEffect(() => {
    const elements = document.querySelectorAll('.animate');
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  return (
    <div className="home-container">
      <NavbarCliente />

      {/* Sección Hero */}
      <section
        className="hero-section animate"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.0), rgba(0,0,0,0.0)), url(${backgroundImage})`
        }}
      >
        <div className="hero-overlay">
          <h1 className="hero-title">
            <span className="highlight">Bienvenido</span> <span className="don-justo">a El Gusto de Don Justo</span>
          </h1>
          <p className="hero-subtitle">Experiencias gastronómicas memorables</p>
          <div className="hero-actions">
            <Link to="/menu" className="hero-button primary">
              Explorar Menú <FiArrowRight className="cta-icon" />
            </Link>
            <Link to="/reservas" className="hero-button secondary">
              Reservar Mesa
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de Especialidades */}
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <LazyLoad height={600} offset={100}>
          <section className="features-section animate">
            <div className="section-header">
              <h2>Nuestras Especialidades</h2>
              <p className="section-subtitle">Sabores que deleitan los sentidos</p>
              <div className="filter-container">
                <div className="filter-buttons">
                  <button className="filter-button active">Todas</button>
                  <button className="filter-button">Entradas</button>
                  <button className="filter-button">Principales</button>
                  <button className="filter-button">Postres</button>
                </div>
              </div>
            </div>
            <Slider {...sliderSettings} className="features-carousel">
              {featuredDishes.map(dish => (
                <div key={dish.id} className="dish-card animate">
                  <div className="dish-plate">
                    <div className="dish-image-container">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        loading="lazy"
                        className="dish-image"
                      />
                    </div>
                    <div className="dish-overlay">
                      <div className="dish-price">${dish.price}</div>
                      <div className="dish-info">
                        <h3>{dish.name}</h3>
                        <p className="dish-description">{dish.description}</p>
                        <Link to="/menu" className="dish-cta">Ver Detalles →</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </section>
        </LazyLoad>
      )}

      {/* Sección de Testimonios */}
      <section className="testimonials-section animate">
        <div className="section-header">
          <FiStar className="section-icon" />
          <h2>Testimonios</h2>
          <p className="section-subtitle">Lo que nuestros clientes dicen</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="testimonial-card animate">
              <div className="testimonial-header">
                <img src={testimonial.avatar} alt={testimonial.author} className="testimonial-avatar" />
                <div className="testimonial-rating">
                  <FiStar /><FiStar /><FiStar /><FiStar /><FiStar />
                </div>
              </div>
              <div className="testimonial-content">
                <p>"{testimonial.text}"</p>
                <h4>- {testimonial.author}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sección de Reservas */}
      <section className="reservation-cta animate">
        <div className="reservation-content">
          <h2>Una experiencia gastronómica única</h2>
          <p>
            Reserva tu mesa y sumérgete en la auténtica cocina argentina. Déjanos llevarte en un viaje de sabores exquisitos, ambiente acogedor y servicio excepcional.
          </p>
          <Link to="/reservas" className="cta-button">Reservar Ahora</Link>
        </div>
      </section>

      {/* Sección de Contacto */}
      <section className="contact-section animate">
        <div className="contact-info">
          <div className="info-card" onClick={toggleMap} style={{ cursor: 'pointer' }}>
            <FiMapPin className="info-icon" />
            <h3>Visítanos</h3>
            <p>Av. 12 de Octubre esquina Guchala</p>
            <p>La Paz, Bolivia</p>
          </div>
          <div className="info-card">
            <FiClock className="info-icon" />
            <h3>Horarios</h3>
            <p>Lun-Sáb: 12:00 - 21:00</p>
            <p>Dom: 12:00 - 18:00</p>
          </div>
          <div className="info-card">
            <FiPhone className="info-icon" />
            <h3>Contacto</h3>
            <p>+591 78833693</p>
            <p>justo99@gmail.com</p>
          </div>
        </div>
      </section>
      {isMapOpen && (
        <div
          className="map-modal-overlay"
          onClick={toggleMap}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if(e.key === 'Escape') toggleMap(); }}
        >
          <div
            className="map-modal-circle"
            onClick={e => e.stopPropagation()} // evita cerrar el modal al hacer clic dentro del círculo
          >
            <iframe
  width="600"
  height="450"
  style={{ border: 0 }}
  loading="lazy"
  allowfullscreen
  referrerpolicy="no-referrer-when-downgrade"
  src="https://www.google.com/maps?q=-16.508253,-68.128520&hl=es&z=18&output=embed">
</iframe>
          </div>
        </div>
      )}
          <a
            href="https://wa.me/59178833693" // reemplaza con el número real sin espacios ni símbolos
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-float"
            title="Contáctanos por WhatsApp"
          >
            <img
              src="https://img.icons8.com/color/48/000000/whatsapp--v1.png"
              alt="WhatsApp"
              className="whatsapp-icon"
            />
          </a>
          
          <Footer />
      <style>{`
        :root {
          --primary-color: #8B0000;
          --secondary-color: #D4AF37;
          --accent-color:#D4AF37;
          --light-bg: #FFF8F0;
          --dark-bg: #2A2A2A;
          --text-dark: #333;
          --text-light: #FFF;
          --overlay-gradient: linear-gradient(135deg, rgba(43,43,43,0.95) 0%, rgba(43,43,43,0.85) 100%);
          --section-spacing: 8rem 0;
          --border-radius: 12px;
          --box-shadow: 0 4px 24px rgba(0,0,0,0.1);
          --transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        
        body {
          font-family: 'Playfair Display', 'Open Sans', sans-serif;
          line-height: 1.6;
          color: var(--text-dark);
          background: var(--light-bg);
          margin: 0;
          padding: 0;
        }
        
        
        .home-container {
          background-color: var(--light-bg);
        }
        
        /* Animación de partículas en el hero */
        .hero-section::after {
          content: '';
          position: absolute;
          width: 150%;
          height: 150%;
          background: radial-gradient(circle at 10% 20%, var(--accent-color) 0%, transparent 2%),
                      radial-gradient(circle at 90% 70%, var(--primary-color) 0%, transparent 3%);
          animation: particles 20s infinite linear;
          opacity: 0.1;
          z-index: 1;
        }
        @keyframes particles {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-50%, -50%); }
        }
        
        /* Hero Section */
        .hero-section {
          background-attachment: fixed;
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          margin-top: 0;
        }
        .hero-overlay {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 4rem 4.5rem;
        }
        .hero-title {
          font-family: 'Cinzel Decorative', cursive;
          font-size: 5rem;
          line-height: 1.1;
          margin-bottom: 2rem;
          text-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
          display: inline-block;
          position: relative;
        }
        .hero-title .highlight {
          color: var(--accent-color);
          display: block;
        }
        .hero-title::after {
          content: '';
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 3px;
          background: var(--accent-color);
          border-radius: 2px;
        }
        .hero-subtitle {
          font-size: 1.8rem;
          color: var(--light-bg);
          max-width: 800px;
          margin: 0 auto 3rem;
          font-weight: 300;
        }
        .hero-actions {
          display: flex;
          gap: 2rem;
          justify-content: center;
        }
        .hero-button {
          padding: 1.2rem 3rem;
          border-radius: 50px;
          font-size: 1.1rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 600;
          transition: var(--transition);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.8rem;
        }
          .whatsapp-float {
          position: fixed;
          width: 60px;
          height: 60px;
          bottom: 20px;
          right: 20px;
          background-color: #25d366;
          color: white;
          border-radius: 50%;
          text-align: center;
          box-shadow: 2px 2px 10px rgba(0,0,0,0.3);
          z-index: 999;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: background 0.3s ease;
        }

        .whatsapp-float:hover {
          background-color: #128c7e;
        }

        .whatsapp-icon {
          width: 35px;
          height: 35px;
        }

        .hero-button.primary {
          background: var(--secondary-color);
          color: var(--primary-color);
          border: 2px solid var(--secondary-color);
        }
        .hero-button.secondary {
          background: transparent;
          border: 2px solid var(--light-bg);
          color: var(--light-bg);
        }
        .hero-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        /* Sección de Especialidades - Platos */
        .features-section {
          padding: var(--section-spacing);
          background: var(--light-bg);
        }
        .section-header {
          text-align: center;
          margin-bottom: 2rem;
          animation: fadeIn 0.8s ease-out;
        }
        .section-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: 3rem;
          color: var(--accent-color);
          margin-bottom: 1rem;
          position: relative;
        }
        .section-header h2::after {
          content: '';
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 3px;
          background: var(--primary-color);
        }
        .section-subtitle {
          font-size: 1.2rem;
          color: var(--accent-color);
          letter-spacing: 1px;
          margin-bottom: 1rem;
        }
        .filter-container {
          margin-top: 1.5rem;
        }
        .filter-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin: 3rem 0;
          flex-wrap: wrap;
        }
        .filter-button {
          padding: 0.8rem 2rem;
          border-radius: 30px;
          background: transparent;
          border: 2px solid var(--primary-color);
          color: var(--primary-color);
          cursor: pointer;
          transition: var(--transition);
          font-size: 1rem;
        }
        .filter-button.active {
          background: var(--primary-color);
          color: var(--light-bg);
        }
        .filter-button:hover {
          background: #e0e0e0;
          transform: translateY(-2px);
        }
        
        .features-carousel {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          perspective: 2000px;
        }
        /* Tarjeta de plato */
        .dish-card {
          position: relative;
          margin: 0 15px;
          transform-style: preserve-3d;
          transition: transform 0.4s;
        }
        /* Contenedor del plato con un rim visible para simular la forma real */
        .dish-plate {
          background: var(--light-bg);
          border: 8px solid var(--secondary-color);
          border-radius: 50%;
          width: 450px;
          height: 450px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
          transition: transform 0.4s ease;
        }
        /* Contenedor interno para la imagen que ocupa el 90% del espacio, dejando el rim visible */
        .dish-image-container {
          position: absolute;
          top: 5%;
          left: 5%;
          width: 90%;
          height: 90%;
          border-radius: 50%;
          overflow: hidden;
          transform: translateZ(20px);
        }
        .dish-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .dish-card:hover .dish-image {
          transform: scale(1.1);
        }
        /* Overlay de información: ocupa la mitad inferior del plato */
        .dish-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: rgba(255,255,255,0.95);
          opacity: 0;
          transition: opacity 0.4s ease, transform 0.4s ease;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 10px;
          overflow: hidden;
        }
        .dish-card:hover .dish-overlay {
          opacity: 1;
          transform: translateY(-5%);
        }
        /* Precio: se muestra dentro del overlay */
        .dish-price {
          background: var(--secondary-color);
          color: var(--text-light);
          padding: 10px 25px;
          border-radius: 30px;
          font-size: 1.4rem;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          margin-bottom: 10px;
        }
        /* Información del plato */
        .dish-info h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          color: var(--accent-color);
          margin-bottom: 0.5rem;
        }
        .dish-info p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 1rem;
          padding: 0 10px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
        .dish-cta {
          display: inline-block;
          margin-top: 10px;
          padding: 10px 25px;
          background: var(--primary-color);
          color: #fff;
          border-radius: 30px;
          transition: all 0.3s ease;
          transform: translateZ(40px);
          text-decoration: none;
        }
        
        /* Sección de Testimonios */
        .testimonials-section {
          padding: var(--section-spacing);
          background: var(--dark-bg);
          color: var(--text-light);
        }
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 3rem;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        .testimonial-card {
          background: var(--light-bg);
          padding: 2.5rem;
          border-radius: var(--border-radius);
          position: relative;
          overflow: hidden;
          box-shadow: var(--box-shadow);
          transition: var(--transition);
          color: var(--dark-bg);
        }
        .testimonial-card:hover {
          transform: translateY(-10px);
        }
        .testimonial-card::before {
          content: '';
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          bottom: 10px;
          border: 2px solid var(--secondary-color);
          border-radius: var(--border-radius);
        }
        .testimonial-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .testimonial-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--secondary-color);
          margin-bottom: 1rem;
        }
        .testimonial-rating {
          color: var(--secondary-color);
          font-size: 1.4rem;
        }
        
        /* Sección de Reservas */
        .reservation-cta {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--dark-bg) 100%);
          padding: 6rem 2rem;
          position: relative;
          overflow: hidden;
        }
        .reservation-cta::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 150%;
          height: 150%;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            var(--accent-color),
            var(--accent-color) 20px
          );
          opacity: 0.1;
          transform: translate(-50%, -50%) rotate(45deg);
          animation: slide 30s linear infinite;
        }
        @keyframes slide {
          0% { transform: translate(-50%, -50%) rotate(45deg) translateX(0); }
          100% { transform: translate(-50%, -50%) rotate(45deg) translateX(-20%); }
        }
        .reservation-content {
          text-align: center;
          position: relative;
          z-index: 1;
          color: var(--text-light);
        }
        .reservation-content h2 {
          font-family: 'Playfair Display', serif;
          font-size: 2.8rem;
          margin-bottom: 1.5rem;
        }
        .reservation-content p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }
        .cta-button {
          display: inline-block;
          padding: 1.2rem 4rem;
          background: var(--secondary-color);
          color: #ffff;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          transition: var(--transition);
          border: 2px solid transparent;
        }
        .cta-button:hover {
          background: transparent;
          border-color: var(--secondary-color);
          color: var(--secondary-color);
        }
        
        /* Sección de Contacto */
        .contact-section {
          padding: var(--section-spacing);
          background: var(--light-bg);
        }
        .contact-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 3rem;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        .info-card {
          text-align: center;
          padding: 2.5rem;
          background: var(--light-bg);
          border: 2px solid rgba(0,0,0,0.1);
          border-radius: var(--border-radius);
          box-shadow: var(--box-shadow);
          transition: var(--transition);
        }
        .info-card:hover {
          transform: translateY(-5px);
        }
          .don-justo {
  color: #ffff; /* o cualquier color específico */
  font-weight: bold;
}
        .info-icon {
          font-size: 2.5rem;
          color: var(--primary-color);
          margin-bottom: 1.5rem;
        }
        .info-card h3 {
          margin-bottom: 1rem;
          color: var(--dark-bg);
        }
        .info-card p {
          font-size: 1.1rem;
          color: #666;
          line-height: 1.8;
          font-family: 'Open Sans', sans-serif;
        }
          .map-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8); /* Fondo oscuro opaco */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.map-modal-circle {
  width: 90vmin; /* círculo responsivo */
  height: 90vmin;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.6);
  position: relative;
  background-color: #000; /* por si el iframe tarda */
}

.map-modal-circle iframe {
  width: 100%;
  height: 100%;
  border: none;
  filter: grayscale(10%) contrast(1.2);
}

        
        /* Animación de Entrada */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .section-header {
          animation: fadeIn 0.8s ease-out;
        }
        
        /* Responsive Design */
        @media (max-width: 1200px) {
          .hero-title { font-size: 4rem; }
          .dish-plate { width: 400px; height: 400px; }
          .dish-image-container { height: 360px; }
        }
        @media (max-width: 992px) {
          .dish-plate { width: 350px; height: 350px; }
          .dish-overlay { padding: 15px; }
        }
        @media (max-width: 768px) {
          .hero-title { font-size: 3rem; }
          .hero-subtitle { font-size: 1.5rem; }
          .filter-buttons { flex-wrap: wrap; }
          .filter-button { width: 100%; text-align: center; }
          .dish-plate { width: 320px; height: 320px; }
          .dish-image-container { height: 280px; }
        }
        @media (max-width: 480px) {
          .hero-title { font-size: 2.5rem; }
          .dish-overlay { padding: 1.5rem; }
          .cta-button { width: 100%; text-align: center; }
        }
      `}</style>
    </div>
  );
}

export default HomeCliente;
