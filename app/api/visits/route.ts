// app/api/visits/route.ts
import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { VisitorData } from "@/lib/analytics";

const VISITS_FILE = join(process.cwd(), "data", "visits.json");

export async function GET() {
  try {
    if (!existsSync(VISITS_FILE)) {
      return NextResponse.json([]);
    }

    const data = readFileSync(VISITS_FILE, "utf-8");
    const visits: VisitorData[] = JSON.parse(data);
    
    // Filter out bots (shouldn't be any, but just in case)
    const uniqueVisits = visits.filter(v => !v.isBot);
    
    return NextResponse.json(uniqueVisits);
  } catch (error) {
    console.error("Error reading visits:", error);
    return NextResponse.json({ error: "Failed to load visits" }, { status: 500 });
  }
}