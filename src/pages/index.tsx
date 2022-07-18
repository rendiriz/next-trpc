import { Suspense, useRef, useState } from 'react';
import type { NextPage } from 'next';
import Image from 'next/image';
import Container from '@/components/Container';
import { trpc } from '@/utils/trpc';

const POKEMON_RANDOM = () => Math.floor(Math.random() * 905);

type PokeCardProps = {
  id: number;
  image: string;
  name: string;
};

function PokeCard({ id, image, name }: PokeCardProps) {
  return (
    <div className="text-center">
      <div className="mt-6 w-64 h-64 rounded-xl border-2 border-gray-300">
        <div className="flex items-center justify-center h-full">
          <Image src={image} alt={name} width={180} height={180} />
        </div>
      </div>
      <h5 className="mt-4 text-2xl capitalize">{name}</h5>
    </div>
  );
}

const HomePage: NextPage = () => {
  const inputEl = useRef(null);
  const [rand, setRand] = useState(POKEMON_RANDOM);

  const session = trpc.useQuery(['auth.getSession']);
  const {
    data: pokemon,
    isLoading,
    isError,
  } = trpc.useQuery(['pokemon.getById', rand]);

  let title = 'Pokemon';
  if (session.data) {
    title = `Rate Pokemon`;
  }

  const leaveVote = async (e: any) => {
    e.preventDefault();

    console.log(inputEl.current.value);
    setRand(POKEMON_RANDOM);
  };

  const nextPokemon = async (e: any) => {
    e.preventDefault();
    setRand(POKEMON_RANDOM);
  };

  return (
    <Suspense fallback={null}>
      <Container>
        <div className="flex flex-col justify-center items-center max-w-4xl border-gray-200 dark:border-gray-700 mx-auto pb-16">
          <div className="text-center mt-8">
            <h1 className="text-4xl">{title}</h1>
            {isLoading && (
              <>
                <div className="flex items-center justify-center mt-6 w-64 h-64 rounded-xl border-2 border-gray-300">
                  Loading...
                </div>
                <div className="mt-4 animate-pulse">
                  <div className="h-[32px] bg-slate-200 rounded"></div>
                </div>
              </>
            )}
            {isError && (
              <>
                <div className="flex items-center justify-center mt-6 w-64 h-64 rounded-xl border-2 border-gray-300">
                  Error...
                </div>
                <div className="mt-4">Error...</div>
              </>
            )}
            {!isLoading && pokemon && <PokeCard {...pokemon} />}

            {session.data ? (
              <form className="relative my-8" onSubmit={leaveVote}>
                <input
                  ref={inputEl}
                  aria-label="Your rate"
                  placeholder="Your rate..."
                  type="number"
                  max="10"
                  required
                  className="px-4 py-2 mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full border-gray-300 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <button
                  className="mt-4 flex items-center justify-center px-4 py-2 font-medium bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md w-full"
                  type="submit"
                >
                  Submit
                </button>
              </form>
            ) : (
              <button
                className="mt-4 flex items-center justify-center px-4 py-2 font-medium bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md w-full"
                type="submit"
                onClick={nextPokemon}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </Container>
    </Suspense>
  );
};

export default HomePage;
