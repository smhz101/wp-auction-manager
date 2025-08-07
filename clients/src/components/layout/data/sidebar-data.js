import PropTypes from 'prop-types';
import {
	IconBarrierBlock,
	IconBrowserCheck,
	IconBug,
	IconChecklist,
	IconError404,
	IconHelp,
	IconLayoutDashboard,
	IconLock,
	IconLockAccess,
	IconMessages,
	IconNotification,
	IconPackages,
	IconPalette,
	IconServerOff,
	IconSettings,
	IconTool,
	IconUserCog,
	IconUserOff,
	IconUsers,
} from '@tabler/icons-react';
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react';

// Sidebar Data (JSX version)
export const sidebarData = {
	user: {
		name: 'satnaing',
		email: 'satnaingdev@gmail.com',
		avatar: '/avatars/shadcn.jpg',
	},
	teams: [
		{
			name: 'Shadcn Admin',
			logo: Command,
			plan: 'Vite + ShadcnUI',
		},
		{
			name: 'Acme Inc',
			logo: GalleryVerticalEnd,
			plan: 'Enterprise',
		},
		{
			name: 'Acme Corp.',
			logo: AudioWaveform,
			plan: 'Startup',
		},
	],
	navGroups: [
		{
			title: 'General',
			items: [
				{
					title: 'Dashboard',
					url: '/',
					icon: IconLayoutDashboard,
				},
				{
					title: 'Tasks',
					url: '/tasks',
					icon: IconChecklist,
				},
				{
					title: 'Apps',
					url: '/apps',
					icon: IconPackages,
				},
				{
					title: 'Chats',
					url: '/chats',
					badge: '3',
					icon: IconMessages,
				},
				{
					title: 'Users',
					url: '/users',
					icon: IconUsers,
				},
				{
					title: 'Secured by Clerk',
					icon: IconMessages,
					items: [
						{ title: 'Sign In', url: '/clerk/sign-in' },
						{ title: 'Sign Up', url: '/clerk/sign-up' },
						{
							title: 'User Management',
							url: '/clerk/user-management',
						},
					],
				},
			],
		},
		{
			title: 'Pages',
			items: [
				{
					title: 'Auth',
					icon: IconLockAccess,
					items: [
						{ title: 'Sign In', url: '/sign-in' },
						{ title: 'Sign In (2 Col)', url: '/sign-in-2' },
						{ title: 'Sign Up', url: '/sign-up' },
						{ title: 'Forgot Password', url: '/forgot-password' },
						{ title: 'OTP', url: '/otp' },
					],
				},
				{
					title: 'Errors',
					icon: IconBug,
					items: [
						{ title: 'Unauthorized', url: '/401', icon: IconLock },
						{ title: 'Forbidden', url: '/403', icon: IconUserOff },
						{ title: 'Not Found', url: '/404', icon: IconError404 },
						{
							title: 'Internal Server Error',
							url: '/500',
							icon: IconServerOff,
						},
						{
							title: 'Maintenance Error',
							url: '/503',
							icon: IconBarrierBlock,
						},
					],
				},
			],
		},
		{
			title: 'Other',
			items: [
				{
					title: 'Settings',
					icon: IconSettings,
					items: [
						{
							title: 'Profile',
							url: '/settings',
							icon: IconUserCog,
						},
						{
							title: 'Account',
							url: '/settings/account',
							icon: IconTool,
						},
						{
							title: 'Appearance',
							url: '/settings/appearance',
							icon: IconPalette,
						},
						{
							title: 'Notifications',
							url: '/settings/notifications',
							icon: IconNotification,
						},
						{
							title: 'Display',
							url: '/settings/display',
							icon: IconBrowserCheck,
						},
					],
				},
				{
					title: 'Help Center',
					url: '/help-center',
					icon: IconHelp,
				},
			],
		},
	],
};

// PropTypes for sidebar structure
export const SidebarItemPropType = PropTypes.shape({
	title: PropTypes.string.isRequired,
	url: PropTypes.string,
	icon: PropTypes.elementType,
	badge: PropTypes.string,
	items: PropTypes.array, // recursive children
});

export const SidebarGroupPropType = PropTypes.shape({
	title: PropTypes.string.isRequired,
	items: PropTypes.arrayOf(SidebarItemPropType),
});

export const SidebarDataPropType = PropTypes.shape({
	user: PropTypes.shape({
		name: PropTypes.string.isRequired,
		email: PropTypes.string.isRequired,
		avatar: PropTypes.string.isRequired,
	}),
	teams: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string.isRequired,
			logo: PropTypes.elementType.isRequired,
			plan: PropTypes.string.isRequired,
		})
	),
	navGroups: PropTypes.arrayOf(SidebarGroupPropType),
});
