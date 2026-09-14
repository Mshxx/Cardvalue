export default async function handler(req, res) {
  try {
    const { id, market = "US" } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Missing card id" });
    }

    const url = new URL(
      `https://api.poketrace.com/v1/cards/${encodeURIComponent(id)}`
    );
    url.searchParams.set("market", market);

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
