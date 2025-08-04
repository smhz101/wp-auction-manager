// import {
//   Routes,
//   Route,
//   MemoryRouter,
//   useNavigate,
//   useLocation,
// } from 'react-router-dom';
// import { useEffect } from 'react';
// // import AdminLayout from '@/components/layout/AdminLayout.jsx';
// import { ThemeProvider } from '@/components/layout/theme-provider.jsx';
// import AllAuctions from './pages/AllAuctions.jsx';
// import Bids from './pages/Bids.jsx';
// import Messages from './pages/Messages.jsx';
// import Logs from './pages/Logs.jsx';
// import FlaggedUsers from './pages/FlaggedUsers.jsx';
// import Settings from './pages/Settings.jsx';

// function AppRoutes() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const path = params.get('path') || '/all-auctions';
//     navigate(path, { replace: true });
//   }, [navigate]);

//   useEffect(() => {
//     const newUrl = `admin.php?page=wpam-auctions&path=${location.pathname}`;
//     window.history.replaceState({}, '', newUrl);
//   }, [location]);

//   return (
//     <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
//       <Routes>
//         <Route path='/all-auctions' element={<AllAuctions />} />
//         <Route path='/bids' element={<Bids />} />
//         <Route path='/messages' element={<Messages />} />
//         <Route path='/logs' element={<Logs />} />
//         <Route path='/flagged-users' element={<FlaggedUsers />} />
//         <Route path='/settings' element={<Settings />} />
//       </Routes>
//     </ThemeProvider>
//   );
// }

// export default function App() {
//   const params = new URLSearchParams(window.location.search);
//   const initialPath = params.get('path') || '/all-auctions';
//   return (
//     <MemoryRouter initialEntries={[initialPath]}>
//       <AppRoutes />
//     </MemoryRouter>
//   );
// }

// src/App.jsx

import {
  Routes,
  Route,
  MemoryRouter,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useEffect } from 'react';
import { ThemeProvider } from '@/components/layout/theme-provider.jsx';

import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';

import AllAuctions from './pages/AllAuctions.jsx';
import Bids from './pages/Bids.jsx';
import Messages from './pages/Messages.jsx';
import Logs from './pages/Logs.jsx';
import FlaggedUsers from './pages/FlaggedUsers.jsx';
import Settings from './pages/Settings.jsx';

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = params.get('path') || '/all-auctions';
    navigate(path, { replace: true });
  }, [navigate]);

  useEffect(() => {
    const newUrl = `admin.php?page=wpam-auctions&path=${location.pathname}`;
    window.history.replaceState({}, '', newUrl);
  }, [location]);

  return (
    <div className='flex flex-col min-h-screen'>
      <Header />

      <Routes>
        <Route path='/all-auctions' element={<AllAuctions />} />
        <Route path='/bids' element={<Bids />} />
        <Route path='/messages' element={<Messages />} />
        <Route path='/logs' element={<Logs />} />
        <Route path='/flagged-users' element={<FlaggedUsers />} />
        <Route path='/settings' element={<Settings />} />
      </Routes>

      <Footer />
    </div>
  );
}

function App() {
  const params = new URLSearchParams(window.location.search);
  const initialPath = params.get('path') || '/all-auctions';

  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </MemoryRouter>
  );
}

export default App;
