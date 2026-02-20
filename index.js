addEventListener("fetch", event => {
  event.respondWith(handleRequest(event))
})

const allowedDomains = ["001test001001.blogspot.com", "example2.com"]; // ← replace with your allowed domains
const tmdbApiKey = "cb192ff121c372a06121e7173f44916c"; // ← your TMDB API key

async function handleRequest(event) {
  const request = event.request;
  const origin = request.headers.get("Origin") || "";
  
  // Only allow requests from allowed domains
  if (!allowedDomains.includes(new URL(origin).hostname)) {
    return new Response("Unauthorized domain", { status: 403 });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("query") || "";
  const endpoint = url.searchParams.get("endpoint") || "search/movie";

  try {
    // Check cache first
    const cache = caches.default;
    let response = await cache.match(request);
    if (!response) {
      // Fetch from TMDB
      const apiRes = await fetch(`https://api.themoviedb.org/3/${endpoint}?api_key=${tmdbApiKey}&query=${encodeURIComponent(query)}`);
      const data = await apiRes.json();
      response = new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
      });
      // Cache for 1 day
      response.headers.set("Cache-Control", "max-age=86400");
      event.waitUntil(cache.put(request, response.clone()));
    }
    return response;
  } catch (e) {
    return new Response("Error: " + e.message, { status: 500 });
  }
}
