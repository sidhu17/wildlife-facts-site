// src/pages/Home.js
import React, { useEffect, useState } from "react";
import { getRandomFact, searchByName, getRandomByCategory } from "../api/wildlifeApi";
import { searchSpecies } from "../api/wiki";
import FactCard from "../components/FactCard";
import "../components/Home.css"; // make sure you have some base styling

const categories = ["Mammal", "Bird", "Insect", "Sea", "Reptile", "Amphibian"];

export default function Home() {
  const [current, setCurrent] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRandom();
  }, []);

  async function fetchRandom() {
    setError(null);
    setLoading(true);
    try {
      const animal = await getRandomFact();
      if (animal && animal.name) {
        setCurrent(animal);
        setResults([]);
      } else {
        setError("No random animal found.");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to fetch random animal.");
    } finally {
      setLoading(false);
    }
  }

  async function onSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setError(null);
    setLoading(true);

    try {
      const wikiResults = await searchSpecies(q);
      if (Array.isArray(wikiResults) && wikiResults.length > 0) {
        const mapped = wikiResults
          .filter((w) => w && w.name)
          .map((w) => ({
            id: w.id,
            name: w.name,
            fact: w.description || "",
            image: w.image || "",
            category: "",
            habitat: "",
            diet: "",
            lifespan: "",
            danger: "",
            sourceUrl: w.sourceUrl || "",
          }));
        setResults(mapped);
        setCurrent(mapped[0] || null);
      } else {
        const local = await searchByName(q);
        const safeLocal = (local || []).filter((a) => a && a.name);
        setResults(safeLocal);
        setCurrent(safeLocal[0] || null);
      }
    } catch (err) {
      console.error(err);
      const local = await searchByName(q);
      const safeLocal = (local || []).filter((a) => a && a.name);
      setResults(safeLocal);
      setCurrent(safeLocal[0] || null);
    } finally {
      setLoading(false);
    }
  }

  async function onRandomCategory(cat) {
    setError(null);
    setSelectedCategory(cat);
    setLoading(true);
    try {
      const animal = await getRandomByCategory(cat);
      if (animal && animal.name) {
        setCurrent(animal);
        setResults([]);
      } else {
        setError(`No animal found in category: ${cat}`);
      }
    } catch (err) {
      console.error(err);
      setError(`Failed to fetch ${cat} category animal.`);
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
            Search
          </button>
        </form>

        <button className="btn" onClick={fetchRandom} disabled={loading}>
          Random fact
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

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Loading...</div>}

      <div style={{ marginBottom: 10 }} className="small-muted">
        Tip: try search or click a category to get an instant random animal from that group.
      </div>

      <div className="cards">
        {results.length > 0
          ? results.map((r) => <FactCard key={r.id || r.name} animal={r} />)
          : current && <FactCard animal={current} />}
      </div>
    </>
  );
}