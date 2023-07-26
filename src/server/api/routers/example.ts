import { object, string } from 'valibot';

import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(object({ text: string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return 'you can now see this secret message!';
  }),
});
