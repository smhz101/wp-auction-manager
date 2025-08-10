import {
	Routes,
	Route,
	MemoryRouter,
	useNavigate,
	useLocation,
} from 'react-router-dom';
import { useEffect } from 'react';

import { SubmenuProvider } from '@/context/submenu-context';
import { SearchProvider } from '@/context/search-context';
import { ThemeProvider } from '@/context/theme-context';
import { ErrorBoundary } from '@/components/layout/error-boundary';

import Auctions from './pages/auctions/index';
import Bids from './pages/bids/index';
import Messages from './pages/messages/index';
import Logs from './pages/logs/index';
import Users from './pages/users/index';
import Settings from './pages/settings/index';
import NotFound from './pages/errors/not-found';

import GeneralSettingPage from './pages/settings/general/index';
import AuctionSettingPage from './pages/settings/auction/index';
import AddonsSettingsPage from './pages/settings/addons/index';

const submenuItems = [
	{ label: 'All Auctions', path: '/all-auctions' },
	{ label: 'Bids', path: '/bids' },
	{ label: 'Messages', path: '/messages' },
	{ label: 'Logs', path: '/logs' },
	{ label: 'Users', path: '/users' },
	{ label: 'Settings', path: '/settings' },
];

function AppRoutes() {
	const navigate = useNavigate();
	const location = useLocation();

	// useEffect(() => {
	//   const params = new URLSearchParams(window.location.search);
	//   const path = params.get('path') || '/all-auctions';
	//   navigate(path, { replace: true });
	// }, [navigate]);

	// useEffect(() => {
	//   const newUrl = `admin.php?page=wpam-auctions&path=${location.pathname}`;
	//   window.history.replaceState({}, '', newUrl);
	// }, [location]);

	// Only navigate on initial mount
	useEffect(() => {
		const pathParam =
			new URLSearchParams(window.location.search).get('path') ||
			'/all-auctions';
		if (location.pathname !== pathParam) {
			navigate(pathParam, { replace: true });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Sync MemoryRouter path to browser query param (one-way sync)
	useEffect(() => {
		const url = new URL(window.location.href);
		const currentPath = url.searchParams.get('path');

		if (currentPath !== location.pathname) {
			url.searchParams.set('path', location.pathname);
			window.history.replaceState({}, '', url);
		}
	}, [location]);

	return (
		<Routes>
			<Route path="/all-auctions" element={<Auctions />} />
			<Route path="/bids" element={<Bids />} />
			<Route path="/messages" element={<Messages />} />
			<Route path="/logs" element={<Logs />} />
			<Route path="/users" element={<Users />} />
			<Route path="/settings" element={<Settings />}>
				<Route index element={<GeneralSettingPage />} />
				<Route path="auction" element={<AuctionSettingPage />} />
				<Route path="addons" element={<AddonsSettingsPage />} />
				{/* 
				<Route path="notifications" element={<Notifications />} />
				<Route path="display" element={<Display />} /> */}
			</Route>
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}

export default function App() {
	const params = new URLSearchParams(window.location.search);
	const initialPath = params.get('path') || '/all-auctions';

	return (
		<MemoryRouter initialEntries={[initialPath]}>
			<SubmenuProvider items={submenuItems}>
				<SearchProvider>
					<ThemeProvider>
						<ErrorBoundary>
							<AppRoutes />
						</ErrorBoundary>
					</ThemeProvider>
				</SearchProvider>
			</SubmenuProvider>
		</MemoryRouter>
	);
}
