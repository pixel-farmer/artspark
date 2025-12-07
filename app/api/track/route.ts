// app/api/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { isBot, parseOS, getLocationFromIP, getClientIP, VisitorData } from "@/lib/analytics";

// Use /tmp for Vercel compatibility, fallback to data/ for local dev
const DATA_DIR = process.env.VERCEL ? "/tmp" : join(process.cwd(), "data");
const VISITS_FILE = join(DATA_DIR, "visits.json");
const ALL_VISITS_FILE = join(DATA_DIR, "all-visits.json");

// Ensure directory exists
try {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (error) {
  console.error("Error creating data directory:", error);
}

function getVisits(): VisitorData[] {
  if (!existsSync(VISITS_FILE)) {
    return [];
  }
  try {
    const data = readFileSync(VISITS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading visits file:", error);
    return [];
  }
}

function getAllVisits(): VisitorData[] {
  if (!existsSync(ALL_VISITS_FILE)) {
    return [];
  }
  try {
    const data = readFileSync(ALL_VISITS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading all visits file:", error);
    return [];
  }
}

function saveVisits(visits: VisitorData[]) {
  try {
    writeFileSync(VISITS_FILE, JSON.stringify(visits, null, 2));
    console.log("Saved visits to:", VISITS_FILE);
  } catch (error) {
    console.error("Error saving visits file:", error);
    throw error;
  }
}

function saveAllVisits(visits: VisitorData[]) {
  try {
    writeFileSync(ALL_VISITS_FILE, JSON.stringify(visits, null, 2));
    console.log("Saved all visits to:", ALL_VISITS_FILE);
  } catch (error) {
    console.error("Error saving all visits file:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ip, userAgent, path } = body;

    console.log("Tracking request received:", { ip, path, hasUserAgent: !!userAgent });

    if (!userAgent) {
      return NextResponse.json({ error: "No user agent" }, { status: 400 });
    }

    // Check if it's a bot
    if (isBot(userAgent)) {
      console.log("Bot detected, not tracking:", userAgent);
      return NextResponse.json({ message: "Bot detected, not tracked" });
    }

    const os = parseOS(userAgent);
    const clientIP = ip || getClientIP(request.headers);
    
    console.log("Getting location for IP:", clientIP);
    // Get location (async, but we'll store it)
    const location = await getLocationFromIP(clientIP);
    console.log("Location resolved:", location);

    const visit: VisitorData = {
      ip: clientIP,
      userAgent,
      os,
      location,
      timestamp: new Date().toISOString(),
      path: path || "/",
      isBot: false,
    };

    // Always save to all visits
    try {
      const allVisits = getAllVisits();
      allVisits.push(visit);
      saveAllVisits(allVisits);
      console.log("Saved to all visits, total:", allVisits.length);
    } catch (error) {
      console.error("Failed to save all visits:", error);
      // Continue anyway
    }

    // Check if this is a unique visitor (same IP in last 1 hour)
    const visits = getVisits();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const isUnique = !visits.some(v => 
      v.ip === visit.ip && 
      new Date(v.timestamp) > oneHourAgo
    );

    if (isUnique) {
      try {
        visits.push(visit);
        saveVisits(visits);
        console.log("Unique visit saved, total unique:", visits.length);
      } catch (error) {
        console.error("Failed to save unique visit:", error);
      }
    } else {
      console.log("Duplicate visit (not unique)");
    }

    return NextResponse.json({ 
      message: isUnique ? "Visit tracked" : "Visit tracked (duplicate)",
      unique: isUnique,
      saved: true
    });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json({ 
      error: "Failed to track visit",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}