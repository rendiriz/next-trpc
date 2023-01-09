import { z } from 'zod';
import { Prisma } from '@prisma/client';

import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';

const Pokemon = z.object({
  id: z.number(),
  name: z.string(),
  image: z.string(),
  rate: z.number().optional(),
  vote: z.number().optional(),
});
const Pokemons = z.array(Pokemon);

export type Pokemon = z.infer<typeof Pokemon>;
export type Pokemons = z.infer<typeof Pokemons>;

export const pokemonRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;

      const items = await ctx.prisma.$queryRaw<Pokemons>(
        Prisma.sql`
          SELECT 
            "Table".id,
            "Table".name,
            "Table".image,
            COALESCE("Table"."rate", 0) as rate,
            COALESCE("Table"."vote", 0) as vote
          FROM (
            SELECT 
              p.*,
              (
                SELECT AVG(rate)::FLOAT FROM "PokemonRate" AS pr 
                WHERE pr."pokemonId" = p."id" 
                GROUP BY pr."pokemonId"
              ) as rate,
              (
                SELECT COUNT(id) FROM "PokemonRate" AS pr 
                WHERE pr."pokemonId" = p."id" 
                GROUP BY pr."pokemonId"
              ) as vote
            FROM "Pokemon" AS p
            ORDER BY p."id" ASC 
          ) as "Table"
          WHERE "Table".id >= ${cursor ? cursor : 0}
          LIMIT ${limit + 1} 
        `,
      );

      let nextCursor: typeof cursor | null = null;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),
});
