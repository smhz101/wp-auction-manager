// src/components/layout/Header.jsx

/**
 * Responsive header with dynamic title, breadcrumb, and theme toggle.
 */
// import { useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import { Sun, Moon } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { useTheme } from '@/components/layout/theme-provider';
// import highlightSubmenu from '@/lib/highlightSubmenu';

// const routeTitles = {
//   '/all-auctions': 'All Auctions',
//   '/bids': 'Bids',
//   '/messages': 'Messages',
//   '/logs': 'Logs',
//   '/flagged-users': 'Flagged Users',
//   '/settings': 'Settings',
// };

// function ModeToggle() {
//   const { setTheme } = useTheme();
//   const location = useLocation();
//   useEffect(() => {
//     highlightSubmenu(location.pathname);
//   }, [location]);

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant='outline' size='icon' className='relative'>
//           <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
//           <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
//           <span className='sr-only'>Toggle theme</span>
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align='end'>
//         <DropdownMenuItem onClick={() => setTheme('light')}>
//           Light
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => setTheme('dark')}>
//           Dark
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => setTheme('system')}>
//           System
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export const Header = ({ className, fixed, children, ...props }) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop);
    };

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true });

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'bg-background flex h-16 items-center gap-3 p-4 sm:gap-4',
        fixed && 'header-fixed peer/header fixed z-50 w-[inherit] rounded-md',
        offset > 10 && fixed ? 'shadow-sm' : 'shadow-none',
        className
      )}
      {...props}
    >
      <Separator orientation='vertical' className='h-6' />
      {children}
    </header>
  );
};

Header.displayName = 'Header';
