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

  rate: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;

      let userId: string = '';
      if (ctx.session) {
        userId = (ctx.session.user as any).id;
      }

      const items = await ctx.prisma.$queryRaw<Pokemons>(
        Prisma.sql`
          SELECT 
            "Table".id,
            "Table".name,
            "Table".image,
            COALESCE("Table"."rate", 0) as rate
          FROM (
            SELECT 
              p.*,
              (
                SELECT rate FROM "PokemonRate" AS pr 
                WHERE pr."pokemonId" = p."id" 
                AND pr."userId" = ${userId}
              ) as rate
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

  upsert: protectedProcedure
    .input(
      z.object({
        pokemonId: z.number(),
        rate: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx.session?.user as any).id;

      const pokemonRate = await ctx.prisma.pokemonRate.findFirst({
        where: { userId, pokemonId: input.pokemonId },
      });

      let result: any;
      if (pokemonRate) {
        result = await ctx.prisma.$executeRaw(
          Prisma.sql`
            UPDATE "PokemonRate" 
            SET rate = ${input.rate},
                "updatedAt" = NOW()
            WHERE "pokemonId" = ${input.pokemonId} 
            AND "userId" = ${userId};
          `,
        );
      } else {
        result = await ctx.prisma.pokemonRate.create({
          data: {
            updatedAt: new Date(),
            userId,
            pokemonId: input.pokemonId,
            rate: input.rate,
          },
        });
      }

      return result;
    }),
});
