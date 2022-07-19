import { useState } from 'react';
import PokeCard from '@/components/PokeCard';
import { trpc } from '@/utils/trpc';
import Rate from 'rc-rate';
import 'rc-rate/assets/index.css';

export default function PokeRate(pokemon: any) {
  const [rating, setRating] = useState(pokemon.rate);
  const session = trpc.useQuery(['auth.getSession']);
  const mutation = trpc.useMutation(['pokemon.upsert']);

  const leaveRate = async (id: number, rate: number) => {
    setRating(rate);
    mutation.mutate({
      pokemonId: id,
      rate,
    });
  };

  return (
    <>
      <PokeCard {...pokemon} />
      {session.data && (
        <div className="mt-2 text-3xl">
          <Rate
            className="!text-3xl"
            count={5}
            value={rating}
            onChange={(rate) => leaveRate(pokemon.id, rate)}
          />
        </div>
      )}
    </>
  );
}
