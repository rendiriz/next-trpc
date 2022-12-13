import React, { Suspense } from 'react';
import { InferGetServerSidePropsType } from 'next';
import type { NextPage } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
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

const RatePage: NextPage = ({
  session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const {
    data: pokemons,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = trpc.useInfiniteQuery(
    [
      'pokemon.rate',
      {
        limit: 6,
      },
    ],
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  console.log(session);

  return (
    <Suspense fallback={null}>
      <Container>
        <div className="border-gray-200 dark:border-gray-700 max-w-4xl mx-auto px-6 pt-12 pb-48">
          <h1 className="text-4xl text-center">Rate Pokemon</h1>

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
      </Container>
    </Suspense>
  );
};

export async function getServerSideProps(context: any) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions,
  );

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}

export default RatePage;
