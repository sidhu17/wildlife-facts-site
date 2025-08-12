// src/pages/Home.js
import React, { useEffect, useState } from "react";
import { getRandomFact, searchByName, getRandomByCategory } from "../api/wildlifeApi";
import { searchSpecies } from "../api/wiki";
import FactCard from "../components/FactCard";
import Spinner from "../components/Spinner";
import "../components/Spinner.css";

const categories = ["Mammal", "Bird", "Insect", "Sea", "Reptile", "Amphibian"];

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
      console.error(e);
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
      // 1) Try Wikipedia/Wikimedia live search
      const wikiResults = await searchSpecies(q);
      if (wikiResults && wikiResults.length > 0) {
        // convert wiki result shape to our FactCard-friendly shape
        const mapped = wikiResults.map((w) => ({
          id: w.id,
          name: w.name,
          fact: w.description,
          image: w.image,
          category: "",
          habitat: "",
          diet: "",
          lifespan: "",
          danger: "",
          sourceUrl: w.sourceUrl,
        }));
        setResults(mapped);
        setCurrent(mapped[0]);
      } else {
        // 2) fallback to local dataset search
        const local = await searchByName(q);
        setResults(local);
        if (local.length > 0) setCurrent(local[0]);
      }
    } catch (err) {
      console.error(err);
      // fallback to local
      const local = await searchByName(q);
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Overlay spinner */}
      {loading && (
        <div className="spinner-overlay" role="status" aria-live="polite">
          <div className="panel">
            <Spinner size={28} inline={false} />
            <div>
              <div style={{ fontWeight: 600 }}>Loading</div>
              <div className="small-muted" style={{ fontSize: 13 }}>
                Fetching data — this may take a second
              </div>
            </div>
          </div>
        </div>
      )}

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
        {results.length > 0 ? (
          results.map((r) => <FactCard key={r.id || r.name} animal={r} />)
        ) : (
          current && <FactCard animal={current} />
        )}
      </div>
    </>
  );
}