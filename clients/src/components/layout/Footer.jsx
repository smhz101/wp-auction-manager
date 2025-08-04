// src/components/layout/Footer.jsx

/**
 * Simple responsive footer for admin pages.
 */

export default function Footer() {
  return (
    <footer className='bg-dark'>
      <div className='container mx-auto px-4 py-4 text-sm text-gray-500 text-center'>
        © {new Date().getFullYear()} WP Plugin Admin. All rights reserved.
      </div>
    </footer>
  );
}
