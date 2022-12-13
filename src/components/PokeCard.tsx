import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Rate from 'rc-rate';
import 'rc-rate/assets/index.css';
import cn from 'classnames';

type PokeCardProps = {
  id: number;
  image: string;
  name: string;
  rate?: number;
  vote?: number;
};

export default function PokeCard({
  id,
  image,
  name,
  rate,
  vote,
}: PokeCardProps) {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="text-center">
      <div
        className={cn(
          !session || router.pathname === '/' ? 'pt-8 pb-4 px-8' : 'p-8',
          'mt-6 rounded-xl border-2 border-gray-300 dark:border-gray-600',
        )}
      >
        <div className="relative flex flex-col items-center justify-center h-full gap-6">
          <Image src={image} alt={name} width={160} height={160} />
          {(!session || router.pathname === '/') && (
            <div className="flex items-center">
              <Rate count={1} value={1} allowHalf={true} disabled={true} />
              <div className="text-sm">
                Score: {Number(rate?.toFixed(1))}/5 · {Number(vote)} vote
              </div>
            </div>
          )}
        </div>
      </div>
      <h5 className="mt-4 text-2xl capitalize">{name}</h5>
    </div>
  );
}
