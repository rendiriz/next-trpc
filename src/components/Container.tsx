import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { NextSeo } from 'next-seo';
import Nav from '@/components/Nav';

type ContainerProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

export default function Container(props: ContainerProps) {
  const { children, ...customMeta } = props;
  const router = useRouter();
  const meta = {
    title: 'PokeRate',
    description: 'A simple rating system for Pokemon.',
    type: 'website',
    ...customMeta,
  };

  return (
    <>
      <NextSeo
        title={meta.title}
        description={meta.description}
        noindex={false}
        canonical={`https://next-trpc-rendiriz.vercel.app${router.asPath}`}
        openGraph={{
          type: 'website',
          url: `https://next-trpc-rendiriz.vercel.app${router.asPath}`,
          title: meta.title,
          description: meta.description,
        }}
      />
      <div className="bg-gray-50 dark:bg-gray-900">
        <Nav />
        <main id="skip" className="bg-gray-50 dark:bg-gray-900 mt-[72px]">
          {children}
        </main>
        <footer className="flex flex-col justify-center items-center max-w-4xl border-gray-200 dark:border-gray-700 mx-auto py-8">
          <NextLink
            href="https://github.com/rendiriz/next-trpc"
            target="_blank"
            className="hover:underline"
          >
            Github
          </NextLink>
        </footer>
      </div>
    </>
  );
}
