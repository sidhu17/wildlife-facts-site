// src/api/wildlifeApi.js
import axios from "axios";
import localData from "../data/animals.json";
import { searchSpecies } from "./wiki"; // <-- import from your wiki.js

/**
 * Map zoo API fields to our internal shape
 */
function mapZooApi(data) {
  return {
    id: `zoo-${data.name}`,
    name: data.name || data.latin_name || "Unknown",
    category: data.animal_type || "Unknown",
    habitat: data.habitat || "",
    diet: data.diet || "",
    lifespan: data.lifespan || "",
    image: data.image_link || "",
    fact: data.geo_range ? `${data.name} is found in ${data.geo_range}.` : "",
  };
}

/**
 * Ensure animal object has an image — try wiki if missing
 */
async function ensureImage(animal) {
  if (!animal) return animal;
  if (animal.image) return animal;
  const wikiResults = await searchSpecies(animal.name);
  if (wikiResults.length > 0 && wikiResults[0].image) {
    return { ...animal, image: wikiResults[0].image };
  }
  return animal;
}

/**
 * Get random animal fact
 * - Dev: Zoo API first
 * - GitHub Pages or CORS fail: Wikipedia
 * - Last fallback: local data
 */
export async function getRandomFact() {
  const isGithubPages = window.location.hostname.endsWith("github.io");

  // Primary: Zoo API (if not on GitHub Pages)
  if (!isGithubPages) {
    try {
      const res = await axios.get(
        "https://zoo-animal-api.herokuapp.com/animals/rand",
        { timeout: 5000 }
      );
      if (res && res.data) {
        let animal = mapZooApi(res.data);
        animal = await ensureImage(animal);
        return animal;
      }
    } catch (e) {
      console.warn("Zoo API failed, falling back to Wikipedia:", e.message);
    }
  }

  // Secondary: Wikipedia random search
  try {
    // Get a truly random animal from Wikipedia search
    const wikiAnimals = await searchSpecies("animal"); 
    if (wikiAnimals.length > 0) {
      return wikiAnimals[Math.floor(Math.random() * wikiAnimals.length)];
    }
  } catch (err) {
    console.warn("Wikipedia API failed:", err.message);
  }

  // Last fallback: local data
  const idx = Math.floor(Math.random() * localData.length);
  return await ensureImage(localData[idx]);
}

export async function searchByName(q) {
  const wikiResults = await searchSpecies(q);
  if (wikiResults.length > 0) {
    return wikiResults;
  }

  // fallback to local data search
  const ql = q.toLowerCase();
  const results = localData.filter(
    (a) =>
      a.name.toLowerCase().includes(ql) ||
      (a.common_names &&
        a.common_names.join(" ").toLowerCase().includes(ql))
  );
  return Promise.all(results.map(ensureImage));
}

export async function getRandomByCategory(category) {
  const filtered = localData.filter(
    (a) =>
      (a.category || "").toLowerCase() ===
      (category || "").toLowerCase()
  );
  if (filtered.length === 0) {
    return getRandomFact();
  }
  const idx = Math.floor(Math.random() * filtered.length);
  return ensureImage(filtered[idx]);
}