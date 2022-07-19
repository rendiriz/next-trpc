import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { MainClient } from 'pokenode-ts';

async function main() {
  const api = new MainClient();

  for (let index = 1; index <= 20; index++) {
    await api.pokemon
      .getPokemonById(index)
      .then(async (data) => {
        let image = data.sprites.other['dream_world']?.front_default;

        if (!image) {
          image = data.sprites.other['official-artwork']?.front_default;
        }

        await prisma.pokemon.upsert({
          where: { id: Number(data.id) },
          update: {},
          create: {
            id: Number(data.id),
            name: data.name,
            image: image || '',
          },
        });
      })
      .catch((error) => console.error(error));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
