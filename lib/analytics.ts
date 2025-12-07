// lib/analytics.ts

export interface VisitorData {
    ip: string;
    userAgent: string;
    os: string;
    browser: string;
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
    
    // Windows detection (more comprehensive)
    if (ua.includes("windows")) {
      if (ua.includes("windows nt 10.0") || ua.includes("windows 10")) return "Windows 10/11";
      if (ua.includes("windows nt 6.3") || ua.includes("windows 8.1")) return "Windows 8.1";
      if (ua.includes("windows nt 6.2") || ua.includes("windows 8")) return "Windows 8";
      if (ua.includes("windows nt 6.1") || ua.includes("windows 7")) return "Windows 7";
      if (ua.includes("windows nt 6.0") || ua.includes("windows vista")) return "Windows Vista";
      if (ua.includes("windows nt 5.1") || ua.includes("windows xp")) return "Windows XP";
      if (ua.includes("windows phone")) return "Windows Phone";
      return "Windows";
    }
    
    // macOS detection (more comprehensive)
    if (ua.includes("mac os x") || ua.includes("macintosh")) {
      // Try to extract macOS version
      const match = ua.match(/mac os x (\d+)[._](\d+)/);
      if (match) {
        const major = parseInt(match[1]);
        const minor = parseInt(match[2]);
        if (major >= 13) return "macOS Ventura/Sonoma";
        if (major >= 12) return "macOS Monterey";
        if (major >= 11) return "macOS Big Sur";
        if (major >= 10 && minor >= 15) return "macOS Catalina";
        if (major >= 10 && minor >= 14) return "macOS Mojave";
      }
      return "macOS";
    }
    
    // Linux detection
    if (ua.includes("linux")) {
      if (ua.includes("ubuntu")) return "Linux (Ubuntu)";
      if (ua.includes("debian")) return "Linux (Debian)";
      if (ua.includes("fedora")) return "Linux (Fedora)";
      if (ua.includes("redhat") || ua.includes("rhel")) return "Linux (Red Hat)";
      if (ua.includes("centos")) return "Linux (CentOS)";
      if (ua.includes("suse")) return "Linux (SUSE)";
      if (ua.includes("android")) return "Android"; // Android is Linux-based
      return "Linux";
    }
    
    // Mobile OS detection
    if (ua.includes("android")) return "Android";
    if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
      // Try to extract iOS version
      const match = ua.match(/os (\d+)[._](\d+)/);
      if (match) {
        const major = parseInt(match[1]);
        if (major >= 17) return "iOS 17+";
        if (major >= 16) return "iOS 16";
        if (major >= 15) return "iOS 15";
        if (major >= 14) return "iOS 14";
      }
      return "iOS";
    }
    
    // Other Unix-like systems
    if (ua.includes("x11")) return "Unix";
    if (ua.includes("freebsd")) return "FreeBSD";
    if (ua.includes("openbsd")) return "OpenBSD";
    if (ua.includes("netbsd")) return "NetBSD";
    if (ua.includes("chrome os")) return "Chrome OS";
    
    // Fallback: try to extract any OS info
    const osMatch = ua.match(/([a-z]+)\s*\d+[._]\d+/);
    if (osMatch) {
      return osMatch[1].charAt(0).toUpperCase() + osMatch[1].slice(1);
    }
    
    return "Unknown";
  }
  
  export function parseBrowser(userAgent: string): string {
    if (!userAgent) return "Unknown";
    
    const ua = userAgent.toLowerCase();
    
    // Chrome and Chromium-based browsers (check first before Edge/Samsung)
    if (ua.includes("edg/")) {
      // Microsoft Edge (Chromium)
      const match = ua.match(/edg\/(\d+)/);
      if (match) return `Edge ${match[1]}`;
      return "Edge";
    }
    
    if (ua.includes("opr/") || ua.includes("opera")) {
      // Opera
      const match = ua.match(/(?:opr|opera)\/(\d+)/);
      if (match) return `Opera ${match[1]}`;
      return "Opera";
    }
    
    if (ua.includes("samsungbrowser")) {
      // Samsung Internet
      const match = ua.match(/samsungbrowser\/(\d+)/);
      if (match) return `Samsung Internet ${match[1]}`;
      return "Samsung Internet";
    }
    
    if (ua.includes("chrome") && !ua.includes("edg") && !ua.includes("opr")) {
      // Chrome (but not Edge or Opera)
      const match = ua.match(/chrome\/(\d+)/);
      if (match) return `Chrome ${match[1]}`;
      return "Chrome";
    }
    
    // Firefox
    if (ua.includes("firefox")) {
      const match = ua.match(/firefox\/(\d+)/);
      if (match) return `Firefox ${match[1]}`;
      return "Firefox";
    }
    
    // Safari (check after Chrome since Safari UA contains "chrome")
    if (ua.includes("safari") && !ua.includes("chrome")) {
      const match = ua.match(/version\/(\d+)/);
      if (match) return `Safari ${match[1]}`;
      return "Safari";
    }
    
    // Internet Explorer / Edge Legacy
    if (ua.includes("msie") || ua.includes("trident")) {
      const match = ua.match(/(?:msie |rv:)(\d+)/);
      if (match) return `Internet Explorer ${match[1]}`;
      return "Internet Explorer";
    }
    
    // Brave (often identifies as Chrome, but has Brave identifier)
    if (ua.includes("brave")) {
      return "Brave";
    }
    
    // Vivaldi
    if (ua.includes("vivaldi")) {
      const match = ua.match(/vivaldi\/(\d+)/);
      if (match) return `Vivaldi ${match[1]}`;
      return "Vivaldi";
    }
    
    // UC Browser
    if (ua.includes("ucbrowser")) {
      const match = ua.match(/ucbrowser\/(\d+)/);
      if (match) return `UC Browser ${match[1]}`;
      return "UC Browser";
    }
    
    // Mobile browsers
    if (ua.includes("safari") && ua.includes("mobile")) {
      return "Mobile Safari";
    }
    
    if (ua.includes("samsungbrowser")) {
      return "Samsung Internet";
    }
    
    // Try to extract browser name from user agent
    const browserMatch = ua.match(/([a-z]+)\/(\d+)/);
    if (browserMatch) {
      const browserName = browserMatch[1];
      if (browserName !== "mozilla" && browserName !== "webkit" && browserName !== "version") {
        return browserName.charAt(0).toUpperCase() + browserName.slice(1);
      }
    }
    
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
    // Use HTTPS and add timeout to avoid security flags
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`https://ip-api.com/json/${ip}?fields=status,message,city,regionName,country`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
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
      // Silently fail - don't log errors that might look suspicious
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("ip-api.com failed, trying fallback");
      }
    }

    // Fallback to ipapi.co
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`https://ipapi.co/${ip}/json/`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (data.error) {
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
      // Silently fail - don't log errors that might look suspicious
      if (error instanceof Error && error.name !== 'AbortError') {
        // Only log non-timeout errors
      }
    }

    // Return Unknown without logging - avoid security flags
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