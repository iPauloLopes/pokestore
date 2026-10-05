import {z} from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  POKEAPI_BASE_URL: z.string().url().default('https://pokeapi.co/api/v2'),
  ASAAS_API_URL: z.string().url().default('https://sandbox.asaas.com/api/v3'),
  ASAAS_API_KEY: z.string().optional()
});

export const env = envSchema.parse(process.env);