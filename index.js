addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

const tmdbApiKey = "cb192ff121c372a06121e7173f44916c";

// List of allowed domains (full subdomains)
const allowedDomains = [
  "001test001001.blogspot.com",
  "example1.com",
  "example2.com"
];

async function handleRequest(request) {
  try {
    const referer = request.headers.get("Referer") || "";

    // ✅ Check if referer contains an allowed domain
    const allowed = allowedDomains.some(domain => referer.includes(domain));
    if (!allowed) {
      return new Response("Unauthorized domain", { status: 403 });
    }

    const url = new URL(request.url);
    const endpoint = url.searchParams.get("endpoint") || "search/movie";
    const query = url.searchParams.get("query") || "";

    // ✅ Optional caching: 1 day
    const cache = caches.default;
    let response = await cache.match(request);
    if (!response) {
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

  } catch (err) {
    return new Response("Error: " + err.message, { status: 500 });
  }
}
