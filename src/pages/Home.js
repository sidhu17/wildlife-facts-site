// src/pages/Home.js
import React, { useEffect, useState } from "react";
import {
  getRandomFact,
  searchByName,
  getRandomByCategory,
} from "../api/wildlifeApi";
import { searchSpecies } from "../api/wiki";
import FactCard from "../components/FactCard";
import Spinner from "../components/Spinner";
import "../components/Spinner.css";

const categories = ["Mammal", "Bird", "Insect", "Sea", "Reptile", "Amphibian"];

function sanitizeAnimal(animal, fallbackId = "animal") {
  return {
    id: animal?.id || `${fallbackId}-${Math.random().toString(36).slice(2)}`,
    name: animal?.name || "Unknown Animal",
    fact: animal?.fact || "No fact available",
    image: animal?.image || "/placeholder.jpg",
    category: animal?.category || "Unknown",
    habitat: animal?.habitat || "Unknown",
    diet: animal?.diet || "Unknown",
    lifespan: animal?.lifespan || "Unknown",
    danger: animal?.danger || "Unknown",
    sourceUrl: animal?.sourceUrl || "",
  };
}

export default function Home() {
  const [current, setCurrent] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchRandom();
  }, []);

  async function fetchRandom() {
    setLoading(true);
    try {
      const animal = await getRandomFact();
      setCurrent(animal);
      setResults([]);
    } catch (e) {
      console.error("Error fetching random fact:", e);
      setCurrent(null);
    } finally {
      setLoading(false);
    }
  }

  async function onSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    try {
      const wikiResults = await searchSpecies(q);
      if (wikiResults && wikiResults.length > 0) {
        const mapped = wikiResults.map((w, i) =>
          sanitizeAnimal(
            {
              id: w.id,
              name: w.name,
              fact: w.description,
              image: w.image,
              sourceUrl: w.sourceUrl,
            },
            `wiki-${i}`
          )
        );
        setResults(mapped);
        setCurrent(mapped[0]);
      } else {
        const local = (await searchByName(q)).map((r, i) =>
          sanitizeAnimal(r, `local-${i}`)
        );
        setResults(local);
        if (local.length > 0) setCurrent(local[0]);
      }
    } catch (err) {
      console.error("Search error:", err);
      const local = (await searchByName(q)).map((r, i) =>
        sanitizeAnimal(r, `local-${i}`)
      );
      setResults(local);
      if (local.length > 0) setCurrent(local[0]);
    } finally {
      setLoading(false);
    }
  }

  async function onRandomCategory(cat) {
    setSelectedCategory(cat);
    setLoading(true);
    try {
      const animal = await getRandomByCategory(cat);
      setCurrent(animal);
      setResults([]);
    } catch (err) {
      console.error(`Error fetching category ${cat}:`, err);
      setCurrent(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="page-title">Discover wildlife facts</div>

      <div className="controls">
        <form onSubmit={onSearch} style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            placeholder="Search an animal (e.g., 'elephant')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner size={14} /> Searching...
              </>
            ) : (
              "Search"
            )}
          </button>
        </form>

        <button className="btn" onClick={fetchRandom} disabled={loading}>
          {loading ? (
            <>
              <Spinner size={14} /> Loading...
            </>
          ) : (
            "Random fact"
          )}
        </button>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginLeft: "auto",
          }}
        >
          <span className="small-muted">Random by category:</span>
          {categories.map((c) => (
            <button
              key={c}
              className="btn"
              style={{
                opacity: selectedCategory === c ? 1 : 0.9,
                padding: "8px 10px",
              }}
              onClick={() => onRandomCategory(c)}
              disabled={loading}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 10 }} className="small-muted">
        Tip: try search or click a category to get an instant random animal from
        that group.
      </div>

      <div className="cards">
        {results.length > 0
          ? results.filter(Boolean).map((r, i) => (
              <FactCard key={r.id || i} animal={sanitizeAnimal(r, `res-${i}`)} />
            ))
          : current && <FactCard animal={sanitizeAnimal(current)} />}
      </div>
    </>
  );
}