"use client";

import { useState } from "react";
import sparksData from "../data/sparks.json";

type Spark = {
  title: string;
  description: string;
  style: string;
  feeling: string;
};

const styles = ["Urban", "Gothic", "Classic", "Surreal", "Folk"];
const feelings = ["Chilled", "Pissed", "Blissful", "Stressed"];

// Optional: background color mapping based on feeling
const feelingColors: { [key: string]: string } = {
  Chilled: "bg-blue-200",
  Pissed: "bg-red-200",
  Blissful: "bg-pink-200",
  Stressed: "bg-yellow-200",
};

export default function ArtSparkPage() {
  const [selectedStyle, setSelectedStyle] = useState("Urban");
  const [selectedFeeling, setSelectedFeeling] = useState("Chilled");
  const [results, setResults] = useState<Spark[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateSpark = () => {
    const filtered = sparksData.filter(
      (spark) => spark.style === selectedStyle && spark.feeling === selectedFeeling
    );

    setHasGenerated(true);

    if (filtered.length === 0) {
      setResults([]);
      return;
    }

    const shuffled = filtered.sort(() => 0.5 - Math.random());

    // Show only two results
    setResults(shuffled.slice(0, 2));
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-6 text-gradient bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Art Spark Generator
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Choose a Style and Feeling — then generate your spark!
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

      {/* Results */}
      <div className="grid gap-8 md:grid-cols-2">
        {results.length > 0 ? (
          results.map((spark, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl shadow-lg transition transform hover:-translate-y-1 hover:shadow-2xl ${
                feelingColors[spark.feeling] || "bg-gray-100"
              }`}
            >
              <h2 className="text-2xl font-bold mb-3">{spark.title}</h2>
              <p className="text-gray-700">{spark.description}</p>
              <div className="mt-3 text-sm text-gray-600">
                Style: {spark.style} | Feeling: {spark.feeling}
              </div>
            </div>
          ))
        ) : hasGenerated ? (
          <p className="col-span-full text-center text-gray-500">
            No Sparks Found. Try a different Style + Feeling!
          </p>
        ) : null}
      </div>
    </div>
  );
}
