import React, { ChangeEvent, Fragment, Suspense, useState } from 'react';
import type { NextPage } from 'next';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Container from '@/components/Container';
import PokeCard from '@/components/PokeCard';
import PokeCardEmpty from '@/components/PokeCardEmpty';
import { api } from '@/utils/api';
import { useDebounce } from '@/hooks/useDebounce';

const HomePage: NextPage = () => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('highest-score');

  const debouncedValue = useDebounce(search, 500);

  const {
    data: pokemons,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = api.pokemon.list.useInfiniteQuery(
    {
      search: debouncedValue,
      sort,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleSort = (value: string) => {
    setSort(value);
  };

  return (
    <Suspense fallback={null}>
      <Container>
        <div className="mx-auto max-w-4xl border-gray-200 px-6 pt-12 pb-48 dark:border-gray-700">
          <h1 className="mb-8 text-center text-4xl">Pokemon</h1>

          <div className="flex gap-4">
            <Input type="text" placeholder="Search" onChange={handleSearch} />
            <Select value={sort} onValueChange={handleSort}>
              <SelectTrigger className="w-[240px] bg-background">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="highest-score">Highest Score</SelectItem>
                <SelectItem value="most-vote">Most Vote</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                  <Fragment key={i}>
                    {group.items.map((pokemon) => (
                      <PokeCard key={pokemon.id} {...pokemon} />
                    ))}
                  </Fragment>
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
