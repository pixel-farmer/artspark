// lib/analytics.ts

export interface VisitorData {
    ip: string;
    userAgent: string;
    os: string;
    location: string;
    timestamp: string;
    path: string;
    isBot: boolean;
  }
  
  // Common bot user agents
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
    /whatsapp/i, /telegram/i, /discordbot/i,
    /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i,
    /baiduspider/i, /yandexbot/i, /sogou/i, /exabot/i,
    /facebot/i, /ia_archiver/i, /curl/i, /wget/i,
    /python/i, /java/i, /go-http/i, /node-fetch/i,
    /axios/i, /okhttp/i, /httpie/i, /postman/i,
    /insomnia/i, /apache/i, /nginx/i, /monitor/i,
    /uptime/i, /pingdom/i, /newrelic/i, /datadog/i,
    /semrush/i, /ahrefs/i, /majestic/i, /moz\.com/i,
  ];
  
  export function isBot(userAgent: string): boolean {
    if (!userAgent) return true;
    return botPatterns.some(pattern => pattern.test(userAgent));
  }
  
  export function parseOS(userAgent: string): string {
    if (!userAgent) return "Unknown";
    
    const ua = userAgent.toLowerCase();
    
    if (ua.includes("windows")) {
      if (ua.includes("windows nt 10.0")) return "Windows 10/11";
      if (ua.includes("windows nt 6.3")) return "Windows 8.1";
      if (ua.includes("windows nt 6.2")) return "Windows 8";
      if (ua.includes("windows nt 6.1")) return "Windows 7";
      return "Windows";
    }
    if (ua.includes("mac os x") || ua.includes("macintosh")) return "macOS";
    if (ua.includes("linux")) return "Linux";
    if (ua.includes("android")) return "Android";
    if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) return "iOS";
    if (ua.includes("x11")) return "Unix";
    
    return "Unknown";
  }
  
  export async function getLocationFromIP(ip: string): Promise<string> {
    // Handle localhost IPs
    if (!ip || ip === "Unknown" || 
        ip === "::1" || ip === "127.0.0.1" || 
        ip.startsWith("127.") || ip.startsWith("::ffff:127.") ||
        ip.startsWith("192.168.") || ip.startsWith("10.") || 
        ip.startsWith("172.16.") || ip.startsWith("172.17.") ||
        ip.startsWith("172.18.") || ip.startsWith("172.19.") ||
        ip.startsWith("172.20.") || ip.startsWith("172.21.") ||
        ip.startsWith("172.22.") || ip.startsWith("172.23.") ||
        ip.startsWith("172.24.") || ip.startsWith("172.25.") ||
        ip.startsWith("172.26.") || ip.startsWith("172.27.") ||
        ip.startsWith("172.28.") || ip.startsWith("172.29.") ||
        ip.startsWith("172.30.") || ip.startsWith("172.31.")) {
      return "Localhost/Development";
    }

    // Try ip-api.com first (free, no API key needed, 45 requests/minute)
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,city,regionName,country`);
      const data = await response.json();
      
      if (data.status === "success") {
        const parts = [];
        if (data.city) parts.push(data.city);
        if (data.regionName) parts.push(data.regionName);
        if (data.country) parts.push(data.country);
        if (parts.length > 0) {
          console.log(`Location resolved for ${ip}:`, parts.join(", "));
          return parts.join(", ");
        }
      }
    } catch (error) {
      console.error("ip-api.com failed, trying fallback:", error);
    }

    // Fallback to ipapi.co
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      
      if (data.error) {
        console.error("ipapi.co error:", data.error);
        return "Unknown";
      }
      
      const parts = [];
      if (data.city) parts.push(data.city);
      if (data.region) parts.push(data.region);
      if (data.country_name) parts.push(data.country_name);
      
      if (parts.length > 0) {
        console.log(`Location resolved for ${ip}:`, parts.join(", "));
        return parts.join(", ");
      }
    } catch (error) {
      console.error("ipapi.co failed:", error);
    }

    console.warn(`Could not resolve location for IP: ${ip}`);
    return "Unknown";
  }
  
  export function getClientIP(headers: Headers): string {
    // Check various headers for the real IP
    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    
    const realIP = headers.get("x-real-ip");
    if (realIP) return realIP;
    
    const cfConnectingIP = headers.get("cf-connecting-ip"); // Cloudflare
    if (cfConnectingIP) return cfConnectingIP;
    
    return "Unknown";
  }