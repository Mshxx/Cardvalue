export default async function handler(req, res) {
  try {
    const { search = "", q = "", market = "US" } = req.query;
    const query = search || q;

    if (!query.trim()) {
      return res.status(400).json({
        error: "Entre un nom de carte ou un numéro."
      });
    }

    if (market !== "US") {
      return res.status(400).json({
        error: "Les données gradées Europe/France seront ajoutées avec nos sources européennes."
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
    url.searchParams.set("limit", "20");
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

    const cards = Array.isArray(result.data)
      ? result.data
      : result.data
        ? [result.data]
        : [];

    const gradedCards = cards
      .map((card) => {
        const salesByGrade = card.ebay?.salesByGrade || {};

        const gradedEntries = Object.entries(salesByGrade)
          .filter(([key, value]) => {
            return (
              key !== "ungraded" &&
              value &&
              Number(value.count) > 0
            );
          })
          .map(([key, value]) => {
            const match = key.match(/^([a-z]+)([0-9_]+)$/i);

            if (!match) return null;

            const grader = match[1].toUpperCase();
            const grade = match[2].replace("_", ".");

            return [
              `${grader}_${grade.replace(".", "_")}`,
              {
                avg: value.averagePrice,
                low: value.minPrice,
                high: value.maxPrice,
                saleCount: value.count,
                median: value.medianPrice,
                lastSaleDate: value.lastSaleDate,
                smartMarketPrice: value.smartMarketPrice
              }
            ];
          })
          .filter(Boolean);

        if (!gradedEntries.length) return null;

        return {
          id: card.tcgPlayerId || card.id,
          tcgPlayerId: card.tcgPlayerId,

          name: card.name,
          cardNumber: card.cardNumber,

          set: {
            name: card.setName
          },

          variant: card.primaryPrinting || "",
          game: "Pokemon",

          image:
            card.imageCdnUrl400 ||
            card.imageCdnUrl200 ||
            card.imageUrl ||
            "",

          currency: "USD",

          prices: {
            ebay: Object.fromEntries(gradedEntries)
          },

          hasGraded: true,

          totalSaleCount: gradedEntries.reduce(
            (total, [, value]) => total + Number(value.saleCount || 0),
            0
          ),

          lastUpdated:
            card.ebay?.updatedAt ||
            card.updatedAt ||
            null
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      data: gradedCards,
      metadata: {
        total: gradedCards.length,
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
