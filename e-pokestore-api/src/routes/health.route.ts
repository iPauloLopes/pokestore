import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/health', {
    schema: {
      tags: ['Monitoramento'],
      summary: 'Verificação de saúde do serviço',
      description: 'Retorna a situação operacional, tempo de atividade e data/hora do sistema.',
      response: {
        200: z.object({
          status: z.literal('ok'),
          uptime: z.number().describe('Tempo de atividade do processo em segundos'),
          timestamp: z.string().datetime().describe('Data e hora no padrão ISO 8601 UTC')
        })
      }
    }
  }, async () => {
    return {
      status: 'ok' as const,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  });
};

