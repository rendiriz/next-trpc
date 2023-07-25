import { useRouter } from 'next/router';
import Link from 'next/link';
import cn from 'classnames';

interface INavItem {
  icon?: JSX.Element;
  href: string;
  text: string;
  className?: string;
}

const NavItem = (props: INavItem) => {
  const router = useRouter();
  const isActive = router.asPath === props.href;

  return (
    <Link
      href={props.href}
      className={cn(
        isActive
          ? 'text-gray-800 dark:text-gray-200'
          : 'text-gray-600 dark:text-gray-400',
        'flex space-x-2 py-4 px-2 font-medium',
        props.className,
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {props.icon}
      <span>{props.text}</span>
    </Link>
  );
};

export default NavItem;
