"use client";

import { useState } from "react";
import sparksData from "../data/sparks.json";

type Spark = {
  title: string;
  description: string;
  style: string;
  feeling: string;
};

type Artwork = {
  id: number;
  title: string;
  image_id: string;
  artist_title?: string; // optional because some works have no artist listed
};

// Style options
const styles = ["Urban", "Gothic", "Classic", "Surreal", "Folk"];

// Feeling options
const feelings = ["Chilled", "Pissed", "Blissful", "Stressed"];

// AIC keyword mapping
const styleKeywords: Record<string, string[]> = {
  Urban: ["city", "urban", "street", "modern"],
  Gothic: ["gothic", "dark", "moody", "medieval"],
  Classic: ["classical", "renaissance", "portrait", "oil"],
  Surreal: ["surreal", "dream", "fantasy", "dali"],
  Folk: [
    "american folk",
    "grandma moses",
    "rural portrait",
    "village scene",
    "folk painting"
  ],
};

// American Gothic override
const AMERICAN_GOTHIC = {
  id: 129884,
  title: "American Gothic",
  image_id: "f6d4e180-0a1c-bf64-6938-d0e2b6f18e3d",
};

export default function ArtSparkPage() {
  const [selectedStyle, setSelectedStyle] = useState("Urban");
  const [selectedFeeling, setSelectedFeeling] = useState("Chilled");
  const [results, setResults] = useState<Spark[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [artResults, setArtResults] = useState<Artwork[]>([]);
  const [loadingArt, setLoadingArt] = useState(false);

  // Fetch artwork by style
  async function fetchArt(style: string) {
    setLoadingArt(true);

    const keywords = styleKeywords[style].join("+");

    const res = await fetch(
      `https://api.artic.edu/api/v1/artworks/search?q=${keywords}&limit=8&fields=id,title,image_id,artist_title`
    );    

    const json = await res.json();

// After fetching artwork data:
let artworks: Artwork[] = (json.data || [])
  .filter((art: any) => art.image_id && art.image_id.trim() !== "")
  .map((art: any) => ({
    id: art.id,
    title: art.title,
    image_id: art.image_id,
    artist_title: art.artist_title || "Unknown Artist",
  }));

// Then before setting artResults — optionally verify image exists:
const validArtworks: Artwork[] = [];

for (let art of artworks) {
  try {
    // attempt a HEAD request to check if image exists
    const imageUrl = `https://www.artic.edu/iiif/2/${art.image_id}/full/400,/0/default.jpg`;
    const head = await fetch(imageUrl, { method: "HEAD" });
    if (head.ok) {
      validArtworks.push(art);
    }
  } catch (e) {
    // ignore — this art entry will be dropped
  }
}

// Maybe also include forced artwork (if style==Gothic)
if (style === "Gothic") {
  validArtworks.unshift(AMERICAN_GOTHIC);
}

// Then finally pick first N valid ones
setArtResults(validArtworks.slice(0, 4));

    setArtResults(artworks);
    setLoadingArt(false);
  }

  // Generate Spark
  const generateSpark = async () => {
    const filtered = sparksData.filter(
      (spark: Spark) =>
        spark.style === selectedStyle && spark.feeling === selectedFeeling
    );

    setHasGenerated(true);

    const shuffled = filtered.sort(() => 0.5 - Math.random());
    setResults(shuffled.slice(0, 2)); // Show only 2 sparks

    // fetch artwork
    fetchArt(selectedStyle);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-6 text-gradient bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Art Sparks!
      </h1>

      <p className="text-center text-gray-600 mb-8">
        Pick a Style and Feeling, then ignite your imagination.
      </p>

      {/* Dropdowns */}
      <div className="flex flex-col md:flex-row justify-center gap-6 mb-8">
        <div>
          <label className="block mb-2 font-semibold">Style</label>
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="border rounded-lg p-2 w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {styles.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold">Feeling</label>
          <select
            value={selectedFeeling}
            onChange={(e) => setSelectedFeeling(e.target.value)}
            className="border rounded-lg p-2 w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {feelings.map((feeling) => (
              <option key={feeling} value={feeling}>
                {feeling}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Button */}
      <div className="text-center mb-10">
        <button
          onClick={generateSpark}
          className="bg-purple-500 text-white px-8 py-3 rounded-full shadow-lg hover:bg-purple-600 transition"
        >
          Generate Spark
        </button>
      </div>

      {/* Sparks */}
      <div className="grid gap-8 md:grid-cols-2 mb-12">
        {results.length > 0 ? (
          results.map((spark, index) => (
            <div
              key={index}
              className="p-6 rounded-xl shadow-lg bg-gray-100 hover:-translate-y-1 hover:shadow-2xl transition"
            >
              <h2 className="text-2xl font-bold mb-3">{spark.title}</h2>
              <p className="text-gray-700">{spark.description}</p>
              <div className="mt-3 text-sm text-gray-500">
                Style: {spark.style} | Feeling: {spark.feeling}
              </div>
            </div>
          ))
        ) : hasGenerated ? (
          <p className="col-span-full text-center text-gray-500">
            No Sparks Found. Try a different Style + Feeling combo!
          </p>
        ) : null}
      </div>

      {/* Art from AIC */}
      <h2 className="text-3xl font-semibold mb-4 text-center">Related Art</h2>

      {loadingArt && (
        <p className="text-center text-gray-500 mb-6">Loading artwork…</p>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {artResults.map((art) => (
          <div
          key={art.id}
          className="rounded-xl shadow-lg bg-white p-4 flex flex-col items-center"
        >
          {art.image_id ? (
            <img
              src={`https://www.artic.edu/iiif/2/${art.image_id}/full/400,/0/default.jpg`}
              alt={art.title}
              className="rounded-lg mb-2"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-2"></div>
          )}
          <p className="font-semibold text-center">{art.title}</p>
          <p className="text-sm text-gray-500 text-center">{art.artist_title}</p>
        </div>
        ))}
      </div>
    </div>
  );
}
