// app/api/visits/route.ts
import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { VisitorData } from "@/lib/analytics";

const VISITS_FILE = join(process.cwd(), "data", "visits.json");
const ALL_VISITS_FILE = join(process.cwd(), "data", "all-visits.json");

export async function GET() {
  try {
    let uniqueVisits: VisitorData[] = [];
    let allVisits: VisitorData[] = [];

    // Read unique visits
    if (existsSync(VISITS_FILE)) {
      try {
        const data = readFileSync(VISITS_FILE, "utf-8");
        uniqueVisits = JSON.parse(data).filter((v: VisitorData) => !v.isBot);
      } catch (error) {
        console.error("Error reading unique visits:", error);
      }
    }

    // Read all visits
    if (existsSync(ALL_VISITS_FILE)) {
      try {
        const data = readFileSync(ALL_VISITS_FILE, "utf-8");
        allVisits = JSON.parse(data).filter((v: VisitorData) => !v.isBot);
      } catch (error) {
        console.error("Error reading all visits:", error);
      }
    }
    
    return NextResponse.json({
      unique: uniqueVisits,
      all: allVisits
    });
  } catch (error) {
    console.error("Error reading visits:", error);
    return NextResponse.json({ error: "Failed to load visits" }, { status: 500 });
  }
}