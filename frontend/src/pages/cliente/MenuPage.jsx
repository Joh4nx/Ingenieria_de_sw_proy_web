// src/pages/cliente/MenuPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import NavbarCliente from '../../components/NavbarCliente';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ReactPageFlip from 'react-pageflip';
import dishPlaceholder from '../../assets/images/placeholder-dish.jpg';
import portadaImage from '../../assets/images/portada-menu.jpg';

const API_MENU_URL =
  process.env.REACT_APP_API_MENU_URL || 'http://localhost:3001/menu';

const PAGE_WIDTH = 900;
const PAGE_HEIGHT = 650;

// Divide un array en trozos de tamaño `size`
const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

// Agrupa y normaliza platos por categoría, usando `imagen` o `imagenUrl` de la BBDD
const groupDishesByCategory = (dishes, allowedCats) =>
  dishes.reduce((acc, dish) => {
    const cat = dish.categoria || 'Sin categoría';
    if (!allowedCats.includes(cat)) return acc;
    // preferimos campo `imagen` (base64 o URL) si existe, si no `imagenUrl`, si no placeholder
    const src =
      dish.imagen?.trim() ||
      dish.imagenUrl?.trim() ||
      dishPlaceholder;
    const p = {
      ...dish,
      imagen: src,
      precio: Number(dish.precio) || 0,
    };
    acc[cat] = acc[cat] || [];
    acc[cat].push(p);
    return acc;
  }, {});

export default function MenuPage() {
  const [dishes, setDishes] = useState([]);
  const [menuPages, setMenuPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categorias = ['Entradas', 'Platos Fuertes', 'Postres', 'Bebidas'];
  const [viewMode, setViewMode] = useState('normal'); // 'normal' o 'libro'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const pageFlip = useRef(null);

  // Detecta ancho para modo móvil
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const isMobile = width < 768;

  // Carga platos al montar
  useEffect(() => {
    fetch(API_MENU_URL)
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : Object.values(data);
        if (!arr.length) throw new Error('No se encontraron platos');
        setDishes(arr);
        // Prepara páginas para flipbook
        const grouped = groupDishesByCategory(arr, categorias);
        const pages = Object.entries(grouped).flatMap(([cat, platos]) => {
          if (platos.length % 2) platos.push(null);
          return chunkArray(platos, 2).map((pair, i) => ({
            tipo: 'contenido',
            categoria: cat,
            platos: pair,
            key: `${cat}-${i}`,
          }));
        });
        setMenuPages([{ tipo: 'portada', key: 'portada' }, ...pages]);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Sincroniza categoría con página flip en modo libro
  useEffect(() => {
    if (viewMode !== 'libro' || !selectedCategory) return;
    const pfApi = pageFlip.current?.pageFlip?.();
    if (!pfApi?.flip) return;
    const idx = menuPages.findIndex(
      p => p.tipo === 'contenido' && p.categoria === selectedCategory
    );
    if (idx >= 0) pfApi.flip(idx);
  }, [selectedCategory, menuPages, viewMode]);

  const handleFlip = e => {
    const idx = e.data;
    setCurrentPage(idx);
    const p = menuPages[idx];
    if (p?.tipo === 'contenido') setSelectedCategory(p.categoria);
  };
  const handlePrev = () => {
    const pfApi = pageFlip.current?.pageFlip?.();
    pfApi?.flipPrev();
  };
  const handleNext = () => {
    const pfApi = pageFlip.current?.pageFlip?.();
    pfApi?.flipNext();
  };

  if (loading) return <div className="mensaje-info">📖 Cargando menú...</div>;
  if (error) return <div className="mensaje-error">❌ {error}</div>;

  // -------- Vista Normal --------
  if (viewMode === 'normal') {
    const grouped = groupDishesByCategory(dishes, categorias);
    return (
      <div className="menu-libro-container">
        <NavbarCliente />
        <div className="view-mode-toggle">
          <button
            className={viewMode === 'normal' ? 'active' : ''}
            onClick={() => setViewMode('normal')}
          >
            Vista normal
          </button>
          <button
            className={viewMode === 'libro' ? 'active' : ''}
            onClick={() => setViewMode('libro')}
          >
            Modo libro
          </button>
        </div>
        <div className="normal-menu">
          {categorias.map(cat =>
            grouped[cat] ? (
              <section key={cat}>
                <h2 className="normal-cat-title">{cat}</h2>
                <div className="normal-platos-grid">
                  {grouped[cat].map(plato => (
                    <PlatoCard key={plato.nombre} plato={plato} />
                  ))}
                </div>
              </section>
            ) : null
          )}
        </div>
        <style>{`
          .menu-libro-container {
            padding: calc(80px + 2rem) 2rem 2rem;
            background: var(--papel-antiguo);
          }
          .view-mode-toggle {
            display: flex; justify-content: center; gap: 1rem; margin-bottom: 1rem;
          }
          .view-mode-toggle button {
            padding: .5rem 1rem; border: 2px solid var(--primary-color);
            background: transparent; color: var(--primary-color);
            cursor: pointer; border-radius: 20px; transition: .3s;
          }
          .view-mode-toggle button.active,
          .view-mode-toggle button:hover {
            background: var(--primary-color); color: #fff;
          }
          .normal-cat-title {
            font-size: 1.5rem; color: var(--primary-color);
            margin: 1rem 0 .5rem; text-align: center;
          }
          .normal-platos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px,1fr));
            gap: 1rem;
          }
          @media(max-width:480px) {
            .normal-platos-grid { grid-template-columns:1fr; }
          }
        `}</style>
      </div>
    );
  }

  // -------- Vista Libro --------
  return (
    <div className="menu-libro-container">
      <NavbarCliente />
      <div className="view-mode-toggle">
        <button
          className={viewMode === 'normal' ? 'active' : ''}
          onClick={() => setViewMode('normal')}
        >
          Vista normal
        </button>
        <button
          className={viewMode === 'libro' ? 'active' : ''}
          onClick={() => setViewMode('libro')}
        >
          Modo libro
        </button>
      </div>

      {currentPage > 0 && (
        <div className="categoria-filtros">
          {categorias.map(cat => (
            <button
              key={cat}
              className={`categoria-btn ${
                selectedCategory === cat ? 'active' : ''
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div
        className="libro-wrapper"
        style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT, margin: '0 auto' }}
      >
        <ReactPageFlip
          ref={pageFlip}
          width={PAGE_WIDTH}
          height={PAGE_HEIGHT}
          showCover
          drawShadow
          maxShadowOpacity={0.5}
          animationDuration={600}
          swipeDistance={30}
          backColor="var(--papel-antiguo)"
          onFlip={handleFlip}
          className="libro-principal"
        >
          {menuPages.map(page =>
            page.tipo === 'portada' ? (
              <div key="portada" className="pagina-libro portada">
                <div className="contenido-portada">
                  <div className="texto-portada">
                    <h1>El Gusto de Don Justo</h1>
                    <h2>Desde 1985</h2>
                  </div>
                </div>
              </div>
            ) : (
              <div key={page.key} className="pagina-libro">
                {page.platos.map((plato, i) => (
                  <div
                    key={i}
                    className={`pagina-lado ${
                      i === 0 ? 'izquierda' : 'derecha'
                    }`}
                  >
                    {plato ? (
                      <PlatoCard plato={plato} />
                    ) : (
                      <div className="plato-vacio">Sin plato</div>
                    )}
                  </div>
                ))}
                <div className="pie-pagina">
                  <span>{currentPage + 1}</span>
                </div>
              </div>
            )
          )}
        </ReactPageFlip>
      </div>

      <div className="controles-navegacion">
        <button onClick={handlePrev} disabled={currentPage === 0}>
          <FiChevronLeft />
        </button>
        <span>
          {currentPage + 1} / {menuPages.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === menuPages.length - 1}
        >
          <FiChevronRight />
        </button>
      </div>

      <style>{`
        :root {
          --papel-antiguo: #FDF5E6;
          --primary-color: #8B0000;
          --accent-color: #3D2B1F;
        }
        .menu-libro-container {
          padding: calc(80px + 2rem) 2rem 2rem;
          background: var(--papel-antiguo);
        }
        .view-mode-toggle {
          display: flex; justify-content: center; gap: 1rem; margin-bottom: 1rem;
        }
        .view-mode-toggle button {
          padding: .5rem 1rem; border: 2px solid var(--primary-color);
          background: transparent; color: var(--primary-color);
          cursor: pointer; border-radius: 20px; transition: .3s;
        }
        .view-mode-toggle button.active,
        .view-mode-toggle button:hover {
          background: var(--primary-color); color: #fff;
        }
        .categoria-filtros {
          display: flex; justify-content: center; gap: .5rem; margin-bottom: 1rem;
        }
        .categoria-btn {
          padding: .5rem 1rem; border: 2px solid var(--primary-color);
          border-radius: 20px; background: transparent;
          color: var(--primary-color); cursor: pointer; transition: .3s;
        }
        .categoria-btn.active,
        .categoria-btn:hover {
          background: var(--primary-color); color: #fff;
        }
        .libro-wrapper {
          perspective: 1200px; margin-bottom: 1rem;
        }
        .libro-principal {
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          overflow: hidden !important; /* oculta cualquier “fantasma” */
        }
        .libro-principal .react-pageflip__cover,
        .libro-principal .react-pageflip__page {
          width: ${PAGE_WIDTH}px !important;
          height: ${PAGE_HEIGHT}px !important;
          background: var(--papel-antiguo);
        }
        .pagina-libro {
          position: relative; display: flex; flex-direction: row;
        }
        .pagina-libro.portada .contenido-portada {
          width: 100%; height: 100%;
          background: url(${portadaImage}) center/cover no-repeat;
          display: flex; align-items: center; justify-content: center;
        }
        .contenido-portada {
          width: 100%; height: 100%;
        }
        .texto-portada {
          background: rgba(255,255,255,0.8); padding: 1rem 2rem;
          text-align: center; border-radius: 8px;
        }
        .texto-portada h1 {
          margin: 0; font-size: 2rem; color: var(--primary-color);
        }
        .texto-portada h2 {
          margin: .5rem 0 0; font-size: 1.2rem; color: var(--accent-color);
        }
        .pagina-lado {
          flex: 1; padding: 1rem; box-sizing: border-box;
        }
        .pagina-lado.izquierda { border-right: 1px solid #ddd; }
        .plato-vacio {
          text-align: center; color: #aaa; padding: 2rem;
        }
        .pie-pagina {
          position: absolute; bottom: 10px; right: 10px;
          color: #555; font-size: 1rem;
        }
        .controles-navegacion {
          display: flex; justify-content: center; align-items: center; gap: 1rem;
        }
        .controles-navegacion button {
          background: var(--primary-color); color: #fff;
          border: none; padding: .5rem; border-radius: 50%;
          cursor: pointer; font-size: 1.25rem;
        }
        .controles-navegacion button:disabled {
          opacity: .5; cursor: default;
        }
        @media(max-width:767px) {
          .pagina-libro {
            flex-direction: column;
          }
          .pagina-lado.izquierda {
            border: none;
          }
        }
      `}</style>
    </div>
  );
}

function PlatoCard({ plato }) {
  if (!plato) return null;
  return (
    <div className="plato-card">
      <img src={plato.imagen} alt={plato.nombre} />
      <h3>{plato.nombre}</h3>
      <p>{plato.descripcion}</p>
      <div className="precio">${plato.precio.toFixed(2)}</div>
      <style>{`
        .plato-card {
          text-align: center;
        }
        .plato-card img {
          width: 100%; max-width: 200px; border-radius: 50%; margin-bottom: .5rem;
        }
        .plato-card h3 {
          margin: .5rem 0; color: var(--accent-color);
        }
        .plato-card p {
          font-size: .9rem; color: #5a4d3e; margin-bottom: .5rem;
        }
        .precio {
          font-size: 1.1rem; color: var(--primary-color); font-weight: bold;
        }
      `}</style>
    </div>
  );
}
