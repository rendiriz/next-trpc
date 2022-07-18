import { Suspense } from 'react';
import type { NextPage } from 'next';
import Container from '@/components/Container';
import { trpc } from '@/utils/trpc';

const HomePage: NextPage = () => {
  const hello = trpc.useQuery(['example.hello', { text: 'from tRPC' }]);

  return (
    <Suspense fallback={null}>
      <Container>
        <div className="flex flex-col justify-center items-start max-w-2xl border-gray-200 dark:border-gray-700 mx-auto pb-16">
          {hello.data ? <p>{hello.data.greeting}</p> : <p>Loading..</p>}
        </div>
      </Container>
    </Suspense>
  );
};

export default HomePage;
