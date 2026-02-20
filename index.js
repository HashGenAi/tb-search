// tmdb-proxy-worker.js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "search";
    const query = url.searchParams.get("q") || "";
    const id = url.searchParams.get("id") || "";

    const apiKey = "cb192ff121c372a06121e7173f44916c"; // your TMDB key

    let tmdbURL = "https://api.themoviedb.org/3/";

    if(type === "search") {
      tmdbURL += `search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
    } else if(type === "details" && id) {
      tmdbURL += `movie/${id}?api_key=${apiKey}`;
    } else if(type === "credits" && id) {
      tmdbURL += `movie/${id}/credits?api_key=${apiKey}`;
    } else if(type === "videos" && id) {
      tmdbURL += `movie/${id}/videos?api_key=${apiKey}`;
    } else {
      return new Response(JSON.stringify([]), {status: 200, headers: {"Content-Type": "application/json"}});
    }

    const resp = await fetch(tmdbURL);
    const data = await resp.text();

    // ✅ Add CORS headers
    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",       // Allow all origins
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*"
      }
    });
  }
}
