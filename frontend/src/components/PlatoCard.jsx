// src/components/PlatoCard.jsx
import React from 'react';
import dishPlaceholder from '../assets/images/placeholder-dish.jpg'; // Asegurate de que la imagen esté dentro de src/assets/images

function PlatoCard({ plato }) {
  // Si no hay imagen o es una cadena vacía, se usa el placeholder
  const imageUrl = plato.imagen && plato.imagen.trim() !== '' ? plato.imagen : dishPlaceholder;

  return (
    <div className="plato-card">
      <div className="image-container">
        <img src={imageUrl} alt={plato.nombre} className="plato-image" />
      </div>
      <div className="plato-info">
        <h3 className="plato-title">{plato.nombre}</h3>
        <p className="plato-description">{plato.descripcion}</p>
        <p className="plato-price">
          <strong>Precio:</strong> ${plato.precio}
        </p>
      </div>
      <style>{`
        .plato-card {
          background: #fff;
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          max-width: 400px;
          margin: 1rem auto;
        }
        .plato-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }
        .image-container {
          width: 100%;
          height: 250px;
          overflow: hidden;
        }
        .plato-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .plato-info {
          padding: 1.2rem;
        }
        .plato-title {
          font-size: 1.8rem;
          color: #333;
          margin-bottom: 0.5rem;
        }
        .plato-description {
          font-size: 1rem;
          color: #666;
          margin-bottom: 0.75rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .plato-price {
          font-size: 1.25rem;
          color: #b22222;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}

export default PlatoCard;
