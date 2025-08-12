// src/api/wildlifeApi.js
import axios from "axios";
import localData from "../data/animals.json";
import { searchSpecies, getSpeciesByTitle } from "./wiki";

/** Map zoo API fields to our internal shape */
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

/** Safe check for GitHub Pages */
const isGithubPages =
  typeof window !== "undefined" &&
  window.location.hostname.endsWith("github.io");

/** Fallback local random animal */
function getLocalRandom() {
  const idx = Math.floor(Math.random() * localData.length);
  return localData[idx];
}

/** Public functions */
export async function getRandomFact() {
  try {
    // Option A: GitHub Pages → use Wikipedia for variety
    if (isGithubPages) {
      const wikiAnimals = await searchSpecies("animal");
      if (wikiAnimals && wikiAnimals.length > 0) {
        return wikiAnimals[Math.floor(Math.random() * wikiAnimals.length)];
      }
    }

    // Option B: Use zoo-animal API
    const res = await axios.get(
      "https://zoo-animal-api.herokuapp.com/animals/rand"
    );
    if (res && res.data) {
      let animal = mapZooApi(res.data);
      if (!animal.image) {
        const wikiAlt = await searchSpecies(animal.name);
        if (wikiAlt && wikiAlt.length > 0) {
          animal.image = wikiAlt[0].image;
        }
      }
      return animal;
    }
  } catch (e) {
    console.error("getRandomFact failed", e);
  }

  // Final fallback
  return getLocalRandom();
}

export async function searchByName(q) {
  if (!q) return [];
  try {
    const ql = q.toLowerCase();

    // Try Wikipedia first
    const wikiResults = await searchSpecies(q);
    if (wikiResults && wikiResults.length > 0) return wikiResults;

    // Fallback: local data search
    const results = localData.filter(
      (a) =>
        a.name.toLowerCase().includes(ql) ||
        (a.common_names &&
          a.common_names.join(" ").toLowerCase().includes(ql))
    );
    return results;
  } catch (e) {
    console.error("searchByName failed", e);
    return [];
  }
}

export async function getRandomByCategory(category) {
  try {
    if (isGithubPages) {
      const wikiAnimals = await searchSpecies(category || "animal");
      if (wikiAnimals && wikiAnimals.length > 0) {
        return wikiAnimals[Math.floor(Math.random() * wikiAnimals.length)];
      }
    }

    const filtered = localData.filter(
      (a) =>
        (a.category || "").toLowerCase() ===
        (category || "").toLowerCase()
    );
    if (filtered.length === 0) {
      return getRandomFact();
    }
    return filtered[Math.floor(Math.random() * filtered.length)];
  } catch (e) {
    console.error("getRandomByCategory failed", e);
    return getLocalRandom();
  }
}