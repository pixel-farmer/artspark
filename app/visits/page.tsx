// app/visits/page.tsx
"use client";

import { useState, useEffect } from "react";
import { VisitorData } from "@/lib/analytics";

export default function VisitsPage() {
  const [visits, setVisits] = useState<VisitorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/visits")
      .then(res => res.json())
      .then(data => {
        // Ensure data is always an array
        if (Array.isArray(data)) {
          setVisits(data);
        } else {
          console.error("Invalid data format:", data);
          setVisits([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load visits:", err);
        setVisits([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  // Ensure visits is always an array before using it
  const visitsArray = Array.isArray(visits) ? visits : [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Visitor Analytics</h1>
        <p className="text-gray-600 mb-8">
          Total Unique Visitors: <span className="font-semibold">{visitsArray.length}</span>
        </p>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operating System
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Path
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visitsArray.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No visits recorded yet
                    </td>
                  </tr>
                ) : (
                  [...visitsArray].reverse().map((visit, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(visit.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                        {visit.ip}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                        {visit.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {visit.os}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {visit.path}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}