import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { trpc } from '@/utils/trpc';
import Rate from 'rc-rate';
import 'rc-rate/assets/index.css';

type PokeCardProps = {
  id: number;
  image: string;
  name: string;
  rate?: number;
};

export default function PokeCard({ id, image, name, rate }: PokeCardProps) {
  const { data: session } = useSession();
  // const session = trpc.useQuery(['auth.getSession']);
  const router = useRouter();

  return (
    <div className="text-center">
      <div className="mt-6 w-64 h-64 rounded-xl border-2 border-gray-300">
        <div className="relative flex items-center justify-center h-full">
          <Image src={image} alt={name} width={160} height={160} />
          {(!session || router.pathname === '/') && (
            <div className="absolute bottom-[10px] right-[15px] text-xl">
              <Rate count={5} value={rate} allowHalf={true} disabled={true} />
            </div>
          )}
        </div>
      </div>
      <h5 className="mt-4 text-2xl capitalize">{name}</h5>
    </div>
  );
}
