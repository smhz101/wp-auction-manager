import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ThemeProvider } from '@/components/layout/theme-provider.jsx';
import highlightSubmenu from '@/lib/highlightSubmenu';
import Header from './Header';

export default function AdminLayout({ children }) {
  const location = useLocation();

  useEffect(() => {
    highlightSubmenu(location.pathname);
  }, [location.pathname]);
  return (
    <ThemeProvider>
      <div className='flex min-h-screen flex-col bg-wp-gray-100 font-sans text-wp-gray-900'>
        <main className='bg-background relative flex w-full flex-1 flex-col md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2'>
          <Header />
          <div className='flex flex-1 flex-col'>
            <div className='@container/main flex flex-1 flex-col gap-2'>
              <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
