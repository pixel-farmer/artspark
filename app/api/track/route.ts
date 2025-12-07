// app/api/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { isBot, parseOS, getLocationFromIP, getClientIP, VisitorData } from "@/lib/analytics";

const VISITS_FILE = join(process.cwd(), "data", "visits.json");

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

function saveVisits(visits: VisitorData[]) {
  try {
    writeFileSync(VISITS_FILE, JSON.stringify(visits, null, 2));
  } catch (error) {
    console.error("Error saving visits file:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ip, userAgent, path } = body;

    if (!userAgent) {
      return NextResponse.json({ error: "No user agent" }, { status: 400 });
    }

    // Check if it's a bot
    if (isBot(userAgent)) {
      return NextResponse.json({ message: "Bot detected, not tracked" });
    }

    const os = parseOS(userAgent);
    const clientIP = ip || getClientIP(request.headers);
    
    // Get location (async, but we'll store it)
    const location = await getLocationFromIP(clientIP);

    const visit: VisitorData = {
      ip: clientIP,
      userAgent,
      os,
      location,
      timestamp: new Date().toISOString(),
      path: path || "/",
      isBot: false,
    };

    // Check if this is a unique visitor (same IP in last 1 hour instead of 24 hours)
    // This is less strict to allow more tracking
    const visits = getVisits();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const isUnique = !visits.some(v => 
      v.ip === visit.ip && 
      new Date(v.timestamp) > oneHourAgo
    );

    if (isUnique) {
      visits.push(visit);
      saveVisits(visits);
      
      if (process.env.NODE_ENV === "development") {
        console.log("Visit tracked:", { ip: clientIP, path, os, location });
      }
    } else {
      if (process.env.NODE_ENV === "development") {
        console.log("Duplicate visit (not tracked):", { ip: clientIP, path });
      }
    }

    return NextResponse.json({ 
      message: isUnique ? "Visit tracked" : "Duplicate visit (not tracked)",
      unique: isUnique 
    });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json({ error: "Failed to track visit" }, { status: 500 });
  }
}