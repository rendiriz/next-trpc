import { useRouter } from 'next/router';
import Link from 'next/link';
import cn from 'classnames';

interface INavItemMobile {
  icon?: JSX.Element;
  href: string;
  text: string;
  className?: string;
}

const NavItemMobile = (props: INavItemMobile) => {
  const router = useRouter();
  const isActive = router.asPath === props.href;

  return (
    <Link
      href={props.href}
      className={cn(
        isActive
          ? 'bg-gray-100/90 text-gray-800 dark:bg-gray-800/90 dark:text-gray-200'
          : 'text-gray-600 dark:text-gray-400',
        'flex space-x-2 py-4 px-6 font-medium',
        props.className,
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {props.icon}
      <span>{props.text}</span>
    </Link>
  );
};

export default NavItemMobile;
