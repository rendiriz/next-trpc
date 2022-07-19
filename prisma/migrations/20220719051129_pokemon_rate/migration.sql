-- CreateTable
CREATE TABLE "PokemonRate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "pokemonId" INTEGER NOT NULL,
    "rate" INTEGER NOT NULL,

    CONSTRAINT "PokemonRate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PokemonRate" ADD CONSTRAINT "PokemonRate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PokemonRate" ADD CONSTRAINT "PokemonRate_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
