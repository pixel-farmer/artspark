"use client";

import { useState } from "react";
import sparksData from "../data/sparks.json";

const themes = ["Fantasy", "Sci-Fi", "Urban", "Nature", "Cozy", "Abstract", "Mystical"];
const moods = [
  "Mysterious",
  "Playful",
  "Calm",
  "Excited",
  "Lonely",
  "Nostalgic",
  "Curious",
  "Happy",
  "Anxious",
  "Sad"
];

// Optional: color mapping for moods
const moodColors: { [key: string]: string } = {
  Mysterious: "bg-purple-200",
  Playful: "bg-pink-200",
  Calm: "bg-blue-200",
  Excited: "bg-yellow-200",
  Lonely: "bg-gray-200",
  Nostalgic: "bg-orange-200",
  Curious: "bg-teal-200",
  Happy: "bg-green-200",
  Anxious: "bg-red-200",
  Sad: "bg-indigo-200"
};

export default function ArtSparkPage() {
  const [selectedTheme, setSelectedTheme] = useState("Fantasy");
  const [selectedMood, setSelectedMood] = useState("Mysterious");
  const [results, setResults] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateSpark = () => {
    const filtered = sparksData.filter(
      (spark) => spark.theme === selectedTheme && spark.mood === selectedMood
    );

    setHasGenerated(true);

    if (filtered.length === 0) {
      setResults([]);
      return;
    }

    const shuffled = filtered.sort(() => 0.5 - Math.random());
     // Show only two sparks at a time
    setResults(shuffled.slice(0, 2));
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-6 text-gradient bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Art Spark Generator
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Select a Theme and Mood, then generate your spark!
      </p>

      {/* Dropdowns */}
      <div className="flex flex-col md:flex-row justify-center gap-6 mb-8">
        <div>
          <label className="block mb-2 font-semibold">Theme</label>
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="border rounded-lg p-2 w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {themes.map((theme) => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 font-semibold">Mood</label>
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            className="border rounded-lg p-2 w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {moods.map((mood) => (
              <option key={mood} value={mood}>{mood}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center mb-10">
        <button
          onClick={generateSpark}
          className="bg-purple-500 text-white px-8 py-3 rounded-full shadow-lg hover:bg-purple-600 transition"
        >
          Generate Spark
        </button>
      </div>

      {/* Sparks */}
      <div className="grid gap-8 md:grid-cols-2">
        {results.length > 0 ? (
          results.map((spark, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl shadow-lg transition transform hover:-translate-y-1 hover:shadow-2xl ${moodColors[spark.mood] || "bg-gray-100"}`}
            >
              <h2 className="text-2xl font-bold mb-3">{spark.title}</h2>
              <p className="text-gray-700">{spark.description}</p>
              <div className="mt-3 text-sm text-gray-500">
                Theme: {spark.theme} | Mood: {spark.mood}
              </div>
            </div>
          ))
        ) : hasGenerated ? (
          <p className="col-span-full text-center text-gray-500">
            No Sparks Found. Try a different combination of Theme and Mood!
          </p>
        ) : null}
      </div>
    </div>
  );
}
