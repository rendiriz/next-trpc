import { useState } from 'react';
import NextLink from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import NavItem from '@/components/NavItem';
import NavItemMobile from '@/components/NavItemMobile';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import * as Collapsible from '@radix-ui/react-collapsible';
import cn from 'classnames';

const Nav = () => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <Collapsible.Root
      className="CollapsibleRoot"
      open={open}
      onOpenChange={setOpen}
    >
      <nav
        className={cn(
          'bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-50',
          'mx-auto max-w-4xl px-4',
        )}
      >
        <div className="relative flex flex-wrap items-center justify-between py-6">
          <div className="flex space-x-2 md:space-x-4 items-center">
            <div className="hidden sm:block">
              <div className="flex space-x-2">
                <NavItem href="/" text="Home" />
                {session && <NavItem href="/rate" text="Rate" />}
              </div>
            </div>
            <Collapsible.Trigger asChild={true}>
              <button
                aria-label="Toggle Nav Mobile"
                type="button"
                className={cn(
                  'text-stone-800 dark:text-stone-50',
                  'sm:hidden inline-flex items-center justify-center rounded-md p-2',
                )}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {open ? (
                    <path d="M6.2253 4.81108C5.83477 4.42056 5.20161 4.42056 4.81108 4.81108C4.42056 5.20161 4.42056 5.83477 4.81108 6.2253L10.5858 12L4.81114 17.7747C4.42062 18.1652 4.42062 18.7984 4.81114 19.1889C5.20167 19.5794 5.83483 19.5794 6.22535 19.1889L12 13.4142L17.7747 19.1889C18.1652 19.5794 18.7984 19.5794 19.1889 19.1889C19.5794 18.7984 19.5794 18.1652 19.1889 17.7747L13.4142 12L19.189 6.2253C19.5795 5.83477 19.5795 5.20161 19.189 4.81108C18.7985 4.42056 18.1653 4.42056 17.7748 4.81108L12 10.5858L6.2253 4.81108Z" />
                  ) : (
                    <>
                      <path d="M2 6C2 5.44772 2.44772 5 3 5H21C21.5523 5 22 5.44772 22 6C22 6.55228 21.5523 7 21 7H3C2.44772 7 2 6.55228 2 6Z" />
                      <path d="M2 12.0322C2 11.4799 2.44772 11.0322 3 11.0322H21C21.5523 11.0322 22 11.4799 22 12.0322C22 12.5845 21.5523 13.0322 21 13.0322H3C2.44772 13.0322 2 12.5845 2 12.0322Z" />
                      <path d="M3 17.0645C2.44772 17.0645 2 17.5122 2 18.0645C2 18.6167 2.44772 19.0645 3 19.0645H21C21.5523 19.0645 22 18.6167 22 18.0645C22 17.5122 21.5523 17.0645 21 17.0645H3Z" />
                    </>
                  )}
                </svg>
              </button>
            </Collapsible.Trigger>
          </div>
          <div className="flex space-x-2 md:space-x-4 items-center">
            <div className="flex space-x-2">
              {!session && (
                <NextLink href="/api/auth/signin/github">
                  <a
                    className={cn(
                      'font-normal text-gray-600 dark:text-gray-400',
                      'flex space-x-2 font-medium py-4 px-2',
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      signIn('github', {
                        callbackUrl: `${window.location.origin}/rate`,
                      });
                    }}
                  >
                    <span className="capsize">Login</span>
                  </a>
                </NextLink>
              )}
              {session && (
                <NextLink href="/">
                  <a
                    className={cn(
                      'font-normal text-gray-600 dark:text-gray-400',
                      'flex space-x-2 font-medium py-4 px-2',
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      signOut({
                        callbackUrl: `${window.location.origin}`,
                      });
                    }}
                  >
                    <span className="capsize">Logout</span>
                  </a>
                </NextLink>
              )}
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </nav>

      <Collapsible.Content>
        <div
          className={cn(
            'bg-gray-50 dark:bg-gray-900',
            'border-b border-gray-300 dark:border-gray-600',
            'absolute z-50 min-w-full mt-[1px]',
          )}
        >
          <div className="flex flex-col">
            <div className="space-y-1 pb-4">
              <NavItemMobile href="/" text="Home" />
              {session && <NavItemMobile href="/rate" text="Rate" />}
            </div>
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

export default Nav;
