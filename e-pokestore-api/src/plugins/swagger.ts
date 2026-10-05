import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';

export const swaggerPlugin = fp(async (app) => {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'PokéStore Experience API (e-pokestore-api)',
        description: 'Camada de experiência para catálogo enriquecido e orquestração de checkout da PokéStore.',
        version: '1.0.0'
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Ambiente Local de Desenvolvimento'
        }
      ]
    },
    transform: jsonSchemaTransform
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs'
  });
});