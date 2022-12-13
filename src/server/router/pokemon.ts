import * as trpc from '@trpc/server';
import { createRouter } from './context';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

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

export const pokemonRouter = createRouter()
  .query('getById', {
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
  })
  .query('list', {
    input: z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.number().nullish(),
    }),
    async resolve({ ctx, input }) {
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
    },
  })
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
    }

    return next();
  })
  .query('rate', {
    input: z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.number().nullish(),
    }),
    async resolve({ ctx, input }) {
      const limit = input.limit ?? 50;
      const { cursor } = input;

      console.log(ctx.session);
      console.log((ctx.session?.user as any).id);

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
    },
  })
  .mutation('upsert', {
    input: z.object({
      pokemonId: z.number(),
      rate: z.number(),
    }),
    async resolve({ ctx, input }) {
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
    },
  });
