import {
  Output,
  array,
  maxRange,
  minRange,
  nullish,
  number,
  object,
  optional,
  string,
} from 'valibot';
import { Prisma } from '@prisma/client';

import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';

const Pokemon = object({
  id: number(),
  name: string(),
  image: string(),
  rate: optional(number()),
  vote: optional(number()),
});
const Pokemons = array(Pokemon);

export type Pokemon = Output<typeof Pokemon>;
export type Pokemons = Output<typeof Pokemons>;

export const pokemonRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      object({
        search: string(),
        sort: string(),
        cursor: nullish(number()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { search, sort, cursor } = input;

      const page = cursor ? cursor : 0;
      const limit = 6;
      const offset = limit * (page + 1) - limit;

      let order;
      switch (sort) {
        case 'name':
          order = 't.name ASC';
          break;
        case 'highest-score':
          order = 'rate DESC, name ASC';
          break;
        case 'most-vote':
          order = 'vote DESC, name ASC';
          break;
        default:
          break;
      }

      const totalItems = await ctx.prisma.pokemon.count({
        where: {
          name: {
            endsWith: search,
            mode: 'insensitive',
          },
        },
      });
      const totalPages = Math.ceil(totalItems / limit);

      const items = await ctx.prisma.$queryRawUnsafe<Pokemons>(
        `
          SELECT 
            t.id,
            t.name,
            t.image,
            COALESCE(t.rate, 0) as rate,
            COALESCE(t.vote, 0) as vote
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
          ) as t
          ${search ? `WHERE t.name ILIKE $1` : ''}
          ORDER BY ${order}
          OFFSET $2
          LIMIT $3
        `,
        `%${search}%`,
        offset,
        limit,
      );

      const nextCursor = page + 1;

      return {
        items,
        nextCursor: nextCursor < totalPages ? nextCursor : undefined,
      };
    }),

  rate: protectedProcedure
    .input(
      object({
        limit: nullish(number([minRange(1), maxRange(100)])),
        cursor: nullish(number()),
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
      object({
        pokemonId: number(),
        rate: number(),
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
