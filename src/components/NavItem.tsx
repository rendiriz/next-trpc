import { useRouter } from 'next/router';
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
    <a
      href={props.href}
      className={cn(
        isActive
          ? 'text-gray-800 dark:text-gray-200'
          : 'text-gray-600 dark:text-gray-400',
        'flex space-x-2 font-medium py-4 px-2',
        props.className,
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {props.icon}
      <span>{props.text}</span>
    </a>
  );
};

export default NavItem;
