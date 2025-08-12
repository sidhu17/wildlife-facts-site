import React from "react";
import "./FactCard.css";

export default function FactCard({ animal }) {
  if (!animal) return null;

  return (
    <article className="fact-card">
      <div className="image-wrap">
        {animal.image ? (
          <img src={animal.image} alt={animal.name} />
        ) : (
          <div className="placeholder">No image</div>
        )}
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