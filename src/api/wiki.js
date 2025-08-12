// src/api/wiki.js
import axios from "axios";

const CACHE_KEY = "wiki_cache_v1";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

async function wikiSearch(query, limit = 5) {
  if (!query) return [];
  const url = "https://en.wikipedia.org/w/api.php";
  const params = {
    action: "query",
    list: "search",
    srsearch: query,
    format: "json",
    origin: "*",
    srlimit: limit,
  };
  const res = await axios.get(url, { params });
  return res.data?.query?.search || [];
}

async function wikiGetPageInfo(title) {
  if (!title) return null;
  const cache = readCache();
  const entry = cache[title];
  const now = Date.now();

  if (entry && entry.ts && now - entry.ts < TTL_MS) {
    return entry.data;
  }

  try {
    const url = "https://en.wikipedia.org/w/api.php";
    const params = {
      action: "query",
      titles: title,
      prop: "extracts|pageimages|pageterms",
      exintro: true,
      explaintext: true,
      piprop: "thumbnail",
      pithumbsize: 800,
      format: "json",
      origin: "*",
    };
    const res = await axios.get(url, { params });
    const pages = res.data?.query?.pages || {};
    const firstKey = Object.keys(pages)[0];
    const page = pages[firstKey];
    if (!page || page.missing) {
      cache[title] = { ts: now, data: null };
      writeCache(cache);
      return null;
    }

    const data = {
      pageid: page.pageid,
      title: page.title,
      extract: page.extract || "",
      thumbnail: page.thumbnail?.source || "",
      terms: page.terms || {},
      url: `https://en.wikipedia.org/?curid=${page.pageid}`,
    };

    cache[title] = { ts: now, data };
    writeCache(cache);

    return data;
  } catch {
    return null;
  }
}

// Wikimedia Commons fallback
async function fetchCommonsImage(query) {
  try {
    const commonsUrl = "https://commons.wikimedia.org/w/api.php";
    const params = {
      action: "query",
      format: "json",
      prop: "imageinfo",
      generator: "search",
      gsrsearch: query,
      gsrlimit: 5,
      iiprop: "url",
      origin: "*",
    };
    const res = await axios.get(commonsUrl, { params });
    const pages = res.data?.query?.pages || {};
    for (const p of Object.values(pages)) {
      const imgUrl = p.imageinfo?.[0]?.url || "";
      if (
        imgUrl &&
        !imgUrl.toLowerCase().endsWith(".svg") &&
        !imgUrl.toLowerCase().includes("locator_map")
      ) {
        return imgUrl;
      }
    }
    return "";
  } catch {
    return "";
  }
}

export async function searchSpecies(query) {
  if (!query) return [];
  const hits = await wikiSearch(query, 6);
  if (!hits || hits.length === 0) return [];

  const titles = hits.map((h) => h.title);

  // Fetch Wikipedia & Commons in parallel for each title
  const results = await Promise.all(
    titles.map(async (title) => {
      const [wikiInfo, commonsImg] = await Promise.all([
        wikiGetPageInfo(title),
        fetchCommonsImage(title),
      ]);

      if (!wikiInfo) return null;

      let image = wikiInfo.thumbnail;
      if (!image || image.toLowerCase().endsWith(".svg")) {
        image = commonsImg || "";
      }

      return {
        id: wikiInfo.pageid,
        name: wikiInfo.title,
        description: wikiInfo.extract,
        image,
        sourceUrl: wikiInfo.url,
      };
    })
  );

  return results.filter(Boolean);
}

export async function getSpeciesByTitle(title) {
  const [info, commonsImg] = await Promise.all([
    wikiGetPageInfo(title),
    fetchCommonsImage(title),
  ]);
  if (!info) return null;

  let image = info.thumbnail;
  if (!image || image.toLowerCase().endsWith(".svg")) {
    image = commonsImg || "";
  }

  return {
    id: info.pageid,
    name: info.title,
    description: info.extract,
    image,
    sourceUrl: info.url,
  };
}