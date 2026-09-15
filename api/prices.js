export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        error: "Carte non sélectionnée."
      });
    }

    const apiKey = process.env.POKEMON_PRICE_TRACKER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "POKEMON_PRICE_TRACKER_API_KEY manquante"
      });
    }

    const url = new URL(
      "https://www.pokemonpricetracker.com/api/v2/cards"
    );

    url.searchParams.set("tcgPlayerId", id);
    url.searchParams.set("includeEbay", "true");

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json"
      }
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(result);
    }

    const card = Array.isArray(result.data)
      ? result.data[0]
      : result.data;

    if (!card) {
      return res.status(404).json({
        error: "Carte introuvable."
      });
    }

    return res.status(200).json({
      data: card,
      metadata: {
        source: "PokemonPriceTracker",
        gradedOnly: true
      }
    });

  } catch (error) {
    return res.status(500).json({
      error: "Erreur serveur",
      message: error.message
    });
  }
}
