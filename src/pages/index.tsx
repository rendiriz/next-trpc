import React, { Suspense } from 'react';
import type { NextPage } from 'next';
import Container from '@/components/Container';
import PokeCard from '@/components/PokeCard';
import PokeCardEmpty from '@/components/PokeCardEmpty';
import { api } from '@/utils/api';

const HomePage: NextPage = () => {
  const {
    data: pokemons,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = api.pokemon.list.useInfiniteQuery(
    {
      limit: 6,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  return (
    <Suspense fallback={null}>
      <Container>
        <div className="mx-auto max-w-4xl border-gray-200 px-6 pt-12 pb-48 dark:border-gray-700">
          <h1 className="text-center text-4xl">Pokemon</h1>

          {status === 'loading' ? (
            <PokeCardEmpty />
          ) : status === 'error' ? (
            <>
              <div className="mt-8">Error: {error.message}</div>
            </>
          ) : (
            <>
              <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {pokemons?.pages.map((group, i) => (
                  <React.Fragment key={i}>
                    {group.items.map((pokemon) => (
                      <PokeCard key={pokemon.id} {...pokemon} />
                    ))}
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-12">
                <button
                  className="mt-4 flex w-full items-center justify-center rounded-md bg-gray-200 px-4 py-2 font-medium text-gray-900 dark:bg-gray-700 dark:text-gray-200"
                  onClick={() => fetchNextPage()}
                  disabled={!hasNextPage || isFetchingNextPage}
                >
                  {isFetchingNextPage
                    ? 'Loading more...'
                    : hasNextPage
                    ? 'Load More'
                    : 'Nothing more to load'}
                </button>
              </div>
            </>
          )}
        </div>
      </Container>
    </Suspense>
  );
};

export default HomePage;
