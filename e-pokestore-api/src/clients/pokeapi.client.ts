import { env } from '../config/env.js';

export interface PokeApiListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{ name: string; url: string }>;
}

export interface PokeApiPokemonDetail {
  id: number;
  name: string;
  base_experience: number;
  types: Array<{
    slot: number;
    type: { name: string; url: string };
  }>;
  sprites: {
    other?: {
      'official-artwork'?: {
        front_default: string | null;
      };
    };
  };
  stats: Array<{
    base_stat: number;
    stat: { name: string };
  }>;
}

export interface PokeApiSpeciesDetail {
  is_legendary: boolean;
  is_mythical: boolean;
}

export class PokeApiClient {
  private baseUrl = env.POKEAPI_BASE_URL;
  private timeoutMs = 4000; // RNF03: Timeout máximo estrito de 4 segundos

  async getPokemonList(limit: number, offset: number): Promise<PokeApiListResponse> {
    const response = await fetch(
      `${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`,
      { signal: AbortSignal.timeout(this.timeoutMs) }
    );

    if (!response.ok) {
      throw new Error(`Erro ao consultar lista da PokeAPI: ${response.statusText}`);
    }

    return response.json() as Promise<PokeApiListResponse>;
  }

  async getPokemonDetail(nameOrId: string | number): Promise<PokeApiPokemonDetail> {
    const response = await fetch(`${this.baseUrl}/pokemon/${nameOrId}`, {
      signal: AbortSignal.timeout(this.timeoutMs)
    });

    if (!response.ok) {
      throw new Error(`Erro ao consultar detalhes do Pokémon na PokeAPI: ${response.statusText}`);
    }

    return response.json() as Promise<PokeApiPokemonDetail>;
  }

  async getPokemonSpecies(nameOrId: string | number): Promise<PokeApiSpeciesDetail> {
    try {
      const response = await fetch(`${this.baseUrl}/pokemon-species/${nameOrId}`, {
        signal: AbortSignal.timeout(this.timeoutMs)
      });

      if (!response.ok) {
        return { is_legendary: false, is_mythical: false };
      }

      return response.json() as Promise<PokeApiSpeciesDetail>;
    } catch {
      return { is_legendary: false, is_mythical: false };
    }
  }
}

export const pokeApiClient = new PokeApiClient();