// src/api/wildlifeApi.js
import axios from "axios";
import localData from "../data/animals.json";

/**
 * Strategy:
 * - Primary: zoo-animal-api for random animals
 * - Secondary: Wikimedia/Wikipedia API to find a page thumbnail for the species name
 * - Fallback: localData
 */

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

/** Try to get a thumbnail from Wikimedia for a given title/name */
async function getWikiThumbnail(title) {
  if (!title) return "";
  try {
    const url = "https://en.wikipedia.org/w/api.php";
    const params = {
      action: "query",
      titles: title,
      prop: "pageimages",
      format: "json",
      pithumbsize: 600,
      origin: "*", // allows CORS
    };
    const res = await axios.get(url, { params });
    if (!res.data || !res.data.query) return "";

    const pages = res.data.query.pages;
    for (const pageId in pages) {
      const page = pages[pageId];
      if (page && page.thumbnail && page.thumbnail.source) {
        return page.thumbnail.source;
      }
    }
    return "";
  } catch (err) {
    // console.warn("Wikimedia thumbnail fetch failed", err);
    return "";
  }
}

/** Ensure animal object has an image — try wiki if missing */
async function ensureImage(animal) {
  if (!animal) return animal;
  if (animal.image) return animal; // already has image
  // try wikimedia by name
  const thumb = await getWikiThumbnail(animal.name);
  if (thumb) {
    return { ...animal, image: thumb };
  }
  // also try common_names if available
  if (animal.common_names && animal.common_names.length > 0) {
    for (const name of animal.common_names) {
      const t = await getWikiThumbnail(name);
      if (t) return { ...animal, image: t };
    }
  }
  return animal;
}

/** Public functions */
export async function getRandomFact() {
  // 1) try zoo-animal-api
  try {
    const res = await axios.get("https://zoo-animal-api.herokuapp.com/animals/rand");
    if (res && res.data) {
      let animal = mapZooApi(res.data);
      // if image missing, try wiki
      animal = await ensureImage(animal);
      return animal;
    }
  } catch (e) {
    // ignore and fallback to local
  }

  // 2) fallback: random from local
  const idx = Math.floor(Math.random() * localData.length);
  const animal = localData[idx];
  return await ensureImage(animal);
}

export async function searchByName(q) {
  const ql = q.toLowerCase();
  const results = localData.filter(
    (a) =>
      a.name.toLowerCase().includes(ql) ||
      (a.common_names && a.common_names.join(" ").toLowerCase().includes(ql))
  );

  // attempt to attach wiki thumbnails to any results missing image (do this in parallel)
  const enhanced = await Promise.all(
    results.map(async (r) => {
      if (!r.image) return ensureImage(r);
      return r;
    })
  );

  return enhanced;
}

export async function getRandomByCategory(category) {
  const filtered = localData.filter((a) => (a.category || "").toLowerCase() === (category || "").toLowerCase());
  if (filtered.length === 0) {
    return getRandomFact();
  }
  const idx = Math.floor(Math.random() * filtered.length);
  const animal = filtered[idx];
  return ensureImage(animal);
}