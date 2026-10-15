import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { catalogService } from '../services/catalog.service.js';

export const catalogRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/catalog', {
    schema: {
      tags: ['Catálogo'],
      summary: 'Lista paginada de Pokémon com precificação dinâmica e estoque',
      description: 'Retorna a vitrine de produtos enriquecida com cálculo de preços em BRL e disponibilidade de estoque.',
      querystring: z.object({
        page: z.coerce.number().min(1).default(1).describe('Número da página'),
        limit: z.coerce.number().min(1).max(50).default(20).describe('Quantidade de itens por página (máx. 50)')
      }),
      response: {
        200: z.object({
          data: z.array(
            z.object({
              id: z.number(),
              name: z.string(),
              price: z.number(),
              stock: z.number(),
              types: z.array(z.string()),
              image: z.string().nullable(),
              isLegendary: z.boolean(),
              isMythical: z.boolean()
            })
          ),
          pagination: z.object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            totalPages: z.number()
          })
        })
      }
    }
  }, async (request) => {
    const { page, limit } = request.query;
    return catalogService.getCatalog(page, limit);
  });
};