import axios from "axios";
import localData from "../data/animals.json";

/**
 * Each returned animal object has this shape:
 * {
 *  id, name, category, habitat, diet, lifespan, image, fact, danger
 * }
 *
 * Strategy:
 * - getRandomFact: try public zoo API; if fails, pick random from localData.
 * - searchByName: search localData (case-insensitive substring).
 * - getRandomByCategory: pick random localData item by category.
 */

function mapZooApi(data) {
  // zoo-animal-api returns fields like name, latin_name, animal_type, habitat, diet, lifespan, image_link
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

export async function getRandomFact() {
  try {
    const res = await axios.get("https://zoo-animal-api.herokuapp.com/animals/rand");
    if (res && res.data) {
      return mapZooApi(res.data);
    }
  } catch (e) {
    // ignore and fallback to local
  }
  // fallback: random from local
  const idx = Math.floor(Math.random() * localData.length);
  return localData[idx];
}

export async function searchByName(q) {
  const ql = q.toLowerCase();
  const results = localData.filter(
    (a) => a.name.toLowerCase().includes(ql) || (a.common_names && a.common_names.join(" ").toLowerCase().includes(ql))
  );
  return results;
}

export async function getRandomByCategory(category) {
  const filtered = localData.filter((a) => (a.category || "").toLowerCase() === (category || "").toLowerCase());
  if (filtered.length === 0) {
    // fallback to any
    return getRandomFact();
  }
  const idx = Math.floor(Math.random() * filtered.length);
  return filtered[idx];
}