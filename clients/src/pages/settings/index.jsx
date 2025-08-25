/** MUST HAVE */
import { useEffect } from 'react';
import { useSubmenu } from '@/context/submenu-context';

/** Local */
import { Outlet } from 'react-router-dom';
import {
	IconBrowserCheck,
	IconNotification,
	IconPalette,
	IconTool,
	IconUser,
} from '@tabler/icons-react';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import SidebarNav from './components/sidebar-nav';

export default function Settings() {
	const { highlightSubmenu } = useSubmenu();

	useEffect(() => {
		highlightSubmenu('/settings');
	}, [highlightSubmenu]);

	return (
		<>
			{/* ===== Top Heading ===== */}
			<Header>
				<Search />
				<div className="ml-auto! flex! items-center! space-x-4!">
					<ThemeSwitch />
				</div>
			</Header>

			<Main fixed>
				<div className="space-y-0.5!">
					<h1 className="text-2xl! font-bold! tracking-tight! md:text-3xl!">
						Settings
					</h1>
					<p className="text-muted-foreground!">
						Manage your account settings and set e-mail preferences.
					</p>
				</div>
				<Separator className="my-4! lg:my-6!" />
				<div className="flex! flex-1! flex-col! space-y-2! overflow-hidden! md:space-y-2! lg:flex-row! lg:space-y-0! lg:space-x-12!">
					<aside className="top-0! lg:sticky! lg:w-1/5!">
						<SidebarNav items={sidebarNavItems} />
					</aside>
					<div className="flex! w-full! overflow-y-hidden! p-1!">
						<Outlet />
					</div>
				</div>
			</Main>
		</>
	);
}

const sidebarNavItems = [
	{
		title: 'General',
		icon: <IconUser size={18} />,
		href: '/settings',
	},
	{
		title: 'Auction',
		icon: <IconTool size={18} />,
		href: '/settings/auction',
	},
	{
		title: 'Addons',
		icon: <IconPalette size={18} />,
		href: '/settings/addons',
	},
	{
		title: 'Notifications',
		icon: <IconNotification size={18} />,
		href: '/settings/notifications',
	},
	{
		title: 'Display',
		icon: <IconBrowserCheck size={18} />,
		href: '/settings/display',
	},
];
