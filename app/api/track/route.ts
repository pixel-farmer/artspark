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
  } catch {
    return [];
  }
}

function saveVisits(visits: VisitorData[]) {
  writeFileSync(VISITS_FILE, JSON.stringify(visits, null, 2));
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

    // Check if this is a unique visitor (same IP + User Agent in last 24 hours)
    const visits = getVisits();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const isUnique = !visits.some(v => 
      v.ip === visit.ip && 
      v.userAgent === visit.userAgent &&
      new Date(v.timestamp) > oneDayAgo
    );

    if (isUnique) {
      visits.push(visit);
      saveVisits(visits);
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