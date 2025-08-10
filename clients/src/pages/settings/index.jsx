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
                                <div className="tw-ml-auto! tw-flex! tw-items-center! tw-space-x-4!">
					<ThemeSwitch />
				</div>
			</Header>

			<Main fixed>
                                <div className="tw-space-y-0.5!">
                                        <h1 className="tw-text-2xl! tw-font-bold! tw-tracking-tight! md:tw-text-3xl!">
						Settings
					</h1>
                                        <p className="tw-text-muted-foreground!">
						Manage your account settings and set e-mail preferences.
					</p>
				</div>
                                <Separator className="tw-my-4! lg:tw-my-6!" />
                                <div className="tw-flex! tw-flex-1! tw-flex-col! tw-space-y-2! tw-overflow-hidden! md:tw-space-y-2! lg:tw-flex-row! lg:tw-space-y-0! lg:tw-space-x-12!">
                                        <aside className="tw-top-0! lg:tw-sticky! lg:tw-w-1/5!">
						<SidebarNav items={sidebarNavItems} />
					</aside>
                                        <div className="tw-flex! tw-w-full! tw-overflow-y-hidden! tw-p-1!">
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
