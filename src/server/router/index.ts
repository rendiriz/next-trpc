// src/server/router/index.ts
import { createRouter } from './context';
import superjson from 'superjson';

import { exampleRouter } from './example';
import { authRouter } from './auth';
import { pokemonRouter } from './pokemon';
import { pokemonRateRouter } from './pokemon-rate';

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('example.', exampleRouter)
  .merge('auth.', authRouter)
  .merge('pokemon.', pokemonRouter)
  .merge('pokemonRate.', pokemonRateRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
