// src/components/FactCard.js
import React, { useState, useEffect } from "react";
import "./FactCard.css";

/**
 * FactCard shows animal image + info.
 * It uses an onError fallback to a placeholder SVG (so images don't appear broken).
 */
export default function FactCard({ animal }) {
  const placeholderSVG = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'>
      <rect width='100%' height='100%' fill='#f6fbf8'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9aa39a' font-family='Arial, sans-serif' font-size='26'>No image available</text>
    </svg>`
  );
  const placeholderDataUrl = `data:image/svg+xml;charset=utf-8,${placeholderSVG}`;

  const [imgSrc, setImgSrc] = useState(placeholderDataUrl);

  useEffect(() => {
    // Use the provided image if available, otherwise placeholder.
    if (animal && animal.image) {
      setImgSrc(animal.image);
    } else {
      setImgSrc(placeholderDataUrl);
    }
  }, [animal]); // update when animal changes

  function handleImageError() {
    // If remote image fails, use placeholder
    setImgSrc(placeholderDataUrl);
  }

  if (!animal) return null;

  return (
    <article className="fact-card">
      <div className="image-wrap">
        <img
          src={imgSrc}
          alt={animal.name || "Animal"}
          onError={handleImageError}
          loading="lazy"
        />
      </div>

      <div className="info">
        <h3>{animal.name}</h3>
        <div className="meta">
          <span>{animal.category || "Unknown"}</span>
          <span>•</span>
          <span className="small-muted">{animal.habitat || "Habitat unknown"}</span>
        </div>

        <p className="desc">{animal.fact || animal.description || ""}</p>

        <ul className="attributes">
          {animal.diet && <li><strong>Diet:</strong> {animal.diet}</li>}
          {animal.lifespan && <li><strong>Lifespan:</strong> {animal.lifespan} years</li>}
          {animal.danger && <li><strong>Danger:</strong> {animal.danger}</li>}
        </ul>
      </div>
    </article>
  );
}
