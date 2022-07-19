import * as trpc from '@trpc/server';
import { createRouter } from './context';
import { z } from 'zod';

export const pokemonRateRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next();
  })
  .mutation('updateByRelation', {
    input: z.object({
      pokemonId: z.number(),
      rate: z.number(),
    }),
    async resolve({ ctx, input }) {
      const userId = (ctx.session?.user as any).id;

      const find = await ctx.prisma.pokemonRate.findFirst({
        where: { userId, pokemonId: input.pokemonId },
      });

      let data: any;
      if (find) {
        data = await ctx.prisma.pokemonRate.update({
          where: { id: find.id },
          data: {
            updatedAt: new Date(),
            rate: input.rate,
          },
        });
      } else {
        data = await ctx.prisma.pokemonRate.create({
          data: {
            updatedAt: new Date(),
            userId,
            pokemonId: input.pokemonId,
            rate: input.rate,
          },
        });
      }

      return data;
    },
  });
