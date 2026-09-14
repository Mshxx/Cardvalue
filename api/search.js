export default async function handler(req, res) {
  try {
    const { search = "", q = "", market = "US" } = req.query;
const query = search || q;

    if (!query.trim()) {
      return res.status(400).json({ error: "Missing search query" });
    }

    const url = new URL("https://api.poketrace.com/v1/cards");
    url.searchParams.set("search", query);
    url.searchParams.set("market", market);
    url.searchParams.set("limit", "20");

    const response = await fetch(url, {
      headers: {
        "X-API-Key": process.env.POKETRACE_API_KEY
      }
    });

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Server error",
      message: error.message
    });
  }
}
