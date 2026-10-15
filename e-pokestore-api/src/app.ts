import fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from 'fastify-type-provider-zod';
import { swaggerPlugin } from './plugins/swagger.js';
import { healthRoutes } from './routes/health.route.js';
import { catalogRoutes } from './routes/catalog.route.js';

export const buildApp = async () => {
  const app = fastify({
    logger: true
  }).withTypeProvider<ZodTypeProvider>();

  // Configuração obrigatória para serialização e validação via Zod
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Registro de plugins de infraestrutura
  await app.register(swaggerPlugin);

  // Registro das rotas versionadas da API
  await app.register(healthRoutes, { prefix: '/api/v1' });
  await app.register(catalogRoutes, { prefix: '/api/v1' });

  return app;
};