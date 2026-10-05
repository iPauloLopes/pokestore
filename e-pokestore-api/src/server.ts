import { buildApp } from './app.js';
import { env } from './config/env.js';

const start = async () => {
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`\n🚀 Servidor em execução: http://localhost:${env.PORT}`);
    console.log(`📄 Documentação interativa (Swagger UI): http://localhost:${env.PORT}/docs\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Tratamento de interrupção graciosa (SIGINT e SIGTERM)
  const shutdown = async () => {
    console.log('\nEncerrando servidor de forma segura...');
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

start();