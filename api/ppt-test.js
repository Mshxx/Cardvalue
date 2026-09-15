export default async function handler(req, res) {
  try {
    const apiKey = process.env.POKEMON_PRICE_TRACKER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "POKEMON_PRICE_TRACKER_API_KEY manquante"
      });
    }

    const url =
      "https://www.pokemonpricetracker.com/api/v2/cards?tcgPlayerId=42360&includeEbay=true";

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json"
      }
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "Erreur lors de l'appel PokemonPriceTracker",
      details: error.message
    });
  }
}
