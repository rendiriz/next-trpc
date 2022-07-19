import React, { Suspense } from 'react';
import type { NextPage } from 'next';
import Container from '@/components/Container';
import PokeRate from '@/components/PokeRate';
import { trpc } from '@/utils/trpc';

function PokeCardEmpty() {
  return (
    <div className="animate-pulse flex flex-col items-center justify-center mt-8">
      <div className="h-[24px] w-[50%] bg-slate-200 rounded"></div>
      <div className="h-[24px] w-[25%] bg-slate-200 rounded mt-4"></div>
    </div>
  );
}

const RatePage: NextPage = () => {
  const {
    data: pokemons,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = trpc.useInfiniteQuery(
    [
      'pokemon.infinite',
      {
        limit: 6,
      },
    ],
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  return (
    <Suspense fallback={null}>
      <Container>
        <div className="flex flex-col justify-center items-center max-w-4xl border-gray-200 dark:border-gray-700 mx-auto pb-48">
          <div className="text-center mt-8">
            <h1 className="text-4xl">Rate Pokemon</h1>

            {status === 'loading' ? (
              <PokeCardEmpty />
            ) : status === 'error' ? (
              <>
                <div className="mt-8">Error: {error.message}</div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                  {pokemons?.pages.map((group, i) => (
                    <React.Fragment key={i}>
                      {group.items.map((pokemon) => (
                        <div key={pokemon.id}>
                          <PokeRate {...pokemon} />
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
                <div className="mt-12">
                  <button
                    className="mt-4 flex items-center justify-center px-4 py-2 font-medium bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-md w-full"
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
        </div>
      </Container>
    </Suspense>
  );
};

export default RatePage;
