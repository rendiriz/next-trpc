import { useState } from 'react';
import { useSession } from 'next-auth/react';
import PokeCard from '@/components/PokeCard';
import { api } from '@/utils/api';
import Rate from 'rc-rate';
import 'rc-rate/assets/index.css';

export default function PokeRate(pokemon: any) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(pokemon.rate);
  const mutation = api.pokemon.upsert.useMutation();

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
      {session && (
        <div className="mt-2 text-center text-3xl">
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
