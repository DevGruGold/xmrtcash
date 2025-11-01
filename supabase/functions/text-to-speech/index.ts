const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
// Configure your Piper microservice URL and defaults via Supabase secrets
// supabase secrets set PIPER_TTS_URL=https://your-piper-host/api/tts PIPER_TTS_VOICE=en_US-kusal-low
const PIPER_URL = Deno.env.get("PIPER_TTS_URL") || ""; // e.g., https://piper.example.com/api/tts
const DEFAULT_VOICE = Deno.env.get("PIPER_TTS_VOICE") || "en_US-kusal-low";
const DEFAULT_FORMAT = (Deno.env.get("PIPER_TTS_FORMAT") || "wav").toLowerCase(); // wav or ogg (depending on your service)
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS
    }
  });
}
Deno.serve(async (req)=>{
  const url = new URL(req.url);
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: CORS_HEADERS
    });
  }
  // Health check / basic info
  if (req.method === "GET" && (url.pathname === "/text-to-speech" || url.pathname === "/")) {
    return jsonResponse({
      status: "ok",
      engine: "piper-tts",
      voice: DEFAULT_VOICE,
      format: DEFAULT_FORMAT
    });
  }
  // Main TTS endpoint (binary passthrough for direct playback)
  if (req.method === "POST") {
    if (!PIPER_URL) {
      return jsonResponse({
        error: "PIPER_TTS_URL is not configured"
      }, 500);
    }
    // Parse body safely
    let body = {};
    try {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        body = await req.json();
      } else {
        const textBody = await req.text();
        body = textBody ? JSON.parse(textBody) : {};
      }
    } catch (e) {
      return jsonResponse({
        error: "Invalid JSON",
        details: String(e)
      }, 400);
    }
    const text = (body.text || "").toString().trim();
    const voice = (body.voice || DEFAULT_VOICE).toString();
    const format = (body.format || DEFAULT_FORMAT).toString().toLowerCase();
    if (!text) {
      return jsonResponse({
        error: "Missing 'text' in body"
      }, 400);
    }
    try {
      const resp = await fetch(PIPER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          voice,
          format
        })
      });
      if (!resp.ok) {
        const errText = await resp.text();
        return jsonResponse({
          error: "Piper request failed",
          status: resp.status,
          details: errText
        }, 502);
      }
      const audioBuf = new Uint8Array(await resp.arrayBuffer());
      const contentType = format === "ogg" ? "audio/ogg" : "audio/wav";
      return new Response(audioBuf, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(audioBuf.byteLength),
          "Cache-Control": "no-store",
          ...CORS_HEADERS
        }
      });
    } catch (e) {
      return jsonResponse({
        error: "Piper fetch error",
        details: String(e)
      }, 502);
    }
  }
  return new Response(JSON.stringify({
    error: "Method not allowed"
  }), {
    status: 405,
    headers: {
      "Content-Type": "application/json",
      "Allow": "GET, POST, OPTIONS",
      ...CORS_HEADERS
    }
  });
});
