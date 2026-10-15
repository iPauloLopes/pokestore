import { pokeApiClient, type PokeApiPokemonDetail } from '../clients/pokeapi.client.js';

export interface CatalogItem {
  id: number;
  name: string;
  price: number;
  stock: number;
  types: string[];
  image: string | null;
  isLegendary: boolean;
  isMythical: boolean;
}

export interface CatalogResponse {
  data: CatalogItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class CatalogService {
  // Relação fixa dos IDs dos Pokémon Iniciais (Gerações 1 a 9)
  private starterIds = new Set([
    1, 4, 7,       // Gen 1: Bulbasaur, Charmander, Squirtle
    152, 155, 158, // Gen 2: Chikorita, Cyndaquil, Totodile
    252, 255, 258, // Gen 3: Treecko, Torchic, Mudkip
    387, 390, 393, // Gen 4: Turtwig, Chimchar, Piplup
    495, 498, 501, // Gen 5: Snivy, Tepig, Oshawott
    650, 653, 656, // Gen 6: Chespin, Fennekin, Froakie
    722, 725, 728, // Gen 7: Rowlet, Litten, Popplio
    810, 813, 816, // Gen 8: Grookey, Scorbunny, Sobble
    906, 909, 912  // Gen 9: Sprigatito, Fuecoco, Quaxly
  ]);

  /**
   * Fórmula de Precificação Dinâmica:
   * (base_experience * 0.50) + (soma dos status base * 0.20)
   * Multiplicador: 3.0x para Lendários ou Míticos
   * Piso mínimo: R$ 15.00
   */
  private calculatePrice(detail: PokeApiPokemonDetail, isLegendaryOrMythical: boolean): number {
    const baseExp = detail.base_experience || 0;
    const totalStats = detail.stats.reduce((acc, stat) => acc + stat.base_stat, 0);

    let rawPrice = (baseExp * 0.50) + (totalStats * 0.20);

    if (isLegendaryOrMythical) {
      rawPrice *= 3.0;
    }

    const finalPrice = Math.max(15.00, rawPrice);
    return Number(finalPrice.toFixed(2));
  }

  /**
   * Regra de Estoque Inicial:
   * - Iniciais: 10 unidades
   * - Lendários / Míticos: 1 unidade
   * - Demais: 50 unidades
   */
  private calculateStock(pokemonId: number, isLegendaryOrMythical: boolean): number {
    if (isLegendaryOrMythical) {
      return 1;
    }
    if (this.starterIds.has(pokemonId)) {
      return 10;
    }
    return 50;
  }

  async getCatalog(page: number = 1, limit: number = 20): Promise<CatalogResponse> {
    const offset = (page - 1) * limit;

    // 1. Busca a lista paginada na PokeAPI
    const listData = await pokeApiClient.getPokemonList(limit, offset);

    // 2. Enriquece cada Pokémon em paralelo buscando detalhes e espécie
    const itemsPromises = listData.results.map(async (item) => {
      const detail = await pokeApiClient.getPokemonDetail(item.name);
      const species = await pokeApiClient.getPokemonSpecies(item.name);

      const isLegendaryOrMythical = species.is_legendary || species.is_mythical;
      const price = this.calculatePrice(detail, isLegendaryOrMythical);
      const stock = this.calculateStock(detail.id, isLegendaryOrMythical);

      const formattedItem: CatalogItem = {
        id: detail.id,
        name: detail.name,
        price,
        stock,
        types: detail.types.map((t) => t.type.name),
        image: detail.sprites.other?.['official-artwork']?.front_default ?? null,
        isLegendary: species.is_legendary,
        isMythical: species.is_mythical
      };

      return formattedItem;
    });

    const data = await Promise.all(itemsPromises);

    return {
      data,
      pagination: {
        page,
        limit,
        total: listData.count,
        totalPages: Math.ceil(listData.count / limit)
      }
    };
  }
}

export const catalogService = new CatalogService();