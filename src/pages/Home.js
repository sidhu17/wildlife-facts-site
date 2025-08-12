import React, { useEffect, useState } from "react";
import { getRandomFact, searchByName, getRandomByCategory } from "../api/wildlifeApi";
import FactCard from "../components/FactCard";

const categories = ["Mammal", "Bird", "Insect", "Sea", "Reptile", "Amphibian"];

export default function Home() {
  const [current, setCurrent] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    // initial random fact
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
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await searchByName(query.trim());
      setResults(res);
      if (res.length > 0) setCurrent(res[0]);
    } catch (err) {
      console.error(err);
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
      <div className="page-title">Discover wildlife facts</div>

      <div className="controls">
        <form onSubmit={onSearch} style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            placeholder="Search an animal (e.g., 'elephant')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn" type="submit">Search</button>
        </form>

        <button className="btn" onClick={fetchRandom} disabled={loading}>
          {loading ? "Loading..." : "Random fact"}
        </button>

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" }}>
          <span className="small-muted">Random by category:</span>
          {categories.map((c) => (
            <button
              key={c}
              className="btn"
              style={{ opacity: selectedCategory === c ? 1 : 0.9, padding: "8px 10px" }}
              onClick={() => onRandomCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 10 }} className="small-muted">
        Tip: try search or click a category to get an instant random animal from that group.
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