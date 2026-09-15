export default async function handler(req, res) {
  try {
    const { search = "", q = "" } = req.query;
    const query = search || q;

    if (!query.trim()) {
      return res.status(400).json({
        error: "Entre le nom d'une carte."
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

    url.searchParams.set("search", query);
    url.searchParams.set("limit", "5");

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

    const cards = Array.isArray(result.data)
      ? result.data
      : result.data
        ? [result.data]
        : [];

    const catalog = cards.map((card) => ({
      id: card.tcgPlayerId || card.id,
      tcgPlayerId: card.tcgPlayerId || card.id,
      name: card.name || "",
      cardNumber: card.cardNumber || "",
      set: card.setName || "",
      variant: card.primaryPrinting || "",
      game: card.game || "Pokemon",
      image:
        card.imageCdnUrl400 ||
        card.imageCdnUrl200 ||
        card.imageUrl ||
        ""
    }));

    return res.status(200).json({
      data: catalog,
      metadata: {
        total: catalog.length,
        source: "PokemonPriceTracker",
        gradedPricesLoaded: false
      }
    });

  } catch (error) {
    return res.status(500).json({
      error: "Erreur serveur",
      message: error.message
    });
  }
}
