// src/components/layout/Header.jsx

/**
 * Responsive header with dynamic title, breadcrumb, and theme toggle.
 */
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/layout/theme-provider';
import highlightSubmenu from '@/lib/highlightSubmenu';

const routeTitles = {
  '/all-auctions': 'All Auctions',
  '/bids': 'Bids',
  '/messages': 'Messages',
  '/logs': 'Logs',
  '/flagged-users': 'Flagged Users',
  '/settings': 'Settings',
};

function ModeToggle() {
  const { setTheme } = useTheme();

  useEffect(() => {
    highlightSubmenu(location.pathname);
  }, [location.pathname]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon' className='relative'>
          <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
          <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header() {
  const location = useLocation();
  const path = location.pathname;
  const pageTitle = routeTitles[path] || 'Dashboard';

  return (
    <header className='bg-white border-b shadow-sm dark:bg-gray-900 dark:border-gray-700'>
      <div className='container mx-auto px-4 py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
        <div className='flex flex-col md:flex-row md:items-center gap-2'>
          <div className='text-xl font-semibold text-gray-800 dark:text-white'>
            {pageTitle}
          </div>
          <nav className='text-sm text-gray-500 dark:text-gray-400'>
            <span className='mr-1'>Admin /</span>
            <span>{pageTitle}</span>
          </nav>
        </div>
        <div className='flex items-center'>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
