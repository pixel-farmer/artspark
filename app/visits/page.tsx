// app/visits/page.tsx
"use client";

import { useState, useEffect } from "react";
import { VisitorData } from "@/lib/analytics";

interface VisitsData {
  unique: VisitorData[];
  all: VisitorData[];
}

export default function VisitsPage() {
  const [visitsData, setVisitsData] = useState<VisitsData>({ unique: [], all: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/visits")
      .then(res => res.json())
      .then(data => {
        // Ensure data has the correct structure
        if (data && Array.isArray(data.unique) && Array.isArray(data.all)) {
          setVisitsData({
            unique: data.unique,
            all: data.all
          });
        } else {
          console.error("Invalid data format:", data);
          setVisitsData({ unique: [], all: [] });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load visits:", err);
        setVisitsData({ unique: [], all: [] });
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

  const uniqueVisits = Array.isArray(visitsData.unique) ? visitsData.unique : [];
  const allVisits = Array.isArray(visitsData.all) ? visitsData.all : [];

  const renderTable = (visits: VisitorData[], title: string) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-gray-600 mb-4">
        Total: <span className="font-semibold">{visits.length}</span>
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
              {visits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No visits recorded yet
                  </td>
                </tr>
              ) : (
                [...visits].reverse().map((visit, index) => (
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
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Visitor Analytics</h1>

        {renderTable(uniqueVisits, "Unique Visitors")}
        {renderTable(allVisits, "All Legitimate Visitors")}
      </div>
    </div>
  );
}