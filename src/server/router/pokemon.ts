import * as trpc from '@trpc/server';
import { createRouter } from './context';
import { z } from 'zod';

const Pokemon = z.object({
  id: z.number(),
  name: z.string(),
  image: z.string(),
});
const Pokemons = z.array(Pokemon);

export type Pokemon = z.infer<typeof Pokemon>;
export type Pokemons = z.infer<typeof Pokemons>;

export const pokemonRouter = createRouter().query('getById', {
  input: z.number(),
  output: Pokemon,
  async resolve(req) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${req.input}`);
    const data = await res.json();

    if (!data) {
      throw new trpc.TRPCError({
        code: 'BAD_REQUEST',
        message: `could not find pokemon with id ${req.input}`,
      });
    }

    return {
      id: data.id,
      name: data.name,
      image: data.sprites.other.dream_world.front_default,
    };
  },
});
