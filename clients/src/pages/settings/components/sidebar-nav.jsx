import PropTypes from 'prop-types';
import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { navigateWithPath } from '@/lib/wp-router';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

export default function SidebarNav({ className, items, ...props }) {
	const location = useLocation();
	const navigate = useNavigate();
	const [val, setVal] = useState(location.pathname ?? '/settings');

	const handleSelect = (value) => {
		setVal(value);
		navigateWithPath(navigate, value);
	};

	return (
		<>
			{/* Mobile Dropdown Nav */}
			<div className="p-1! md:hidden!">
				<Select value={val} onValueChange={handleSelect}>
					<SelectTrigger className="h-12! sm:w-48!">
						<SelectValue placeholder="Select a section" />
					</SelectTrigger>
					<SelectContent>
						{items.map((item) => (
							<SelectItem key={item.href} value={item.href}>
								<div className="flex! gap-x-4! px-2! py-1!">
									<span className="scale-125!">
										{item.icon}
									</span>
									<span className="text-md!">
										{item.title}
									</span>
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Desktop Sidebar Nav */}
			<ScrollArea
				orientation="horizontal"
				type="always"
				className="bg-background! hidden! w-full! min-w-40! px-1! py-2! md:block!"
			>
				<nav
					className={cn(
						'flex! space-x-2! py-1! lg:flex-col! lg:space-y-1! lg:space-x-0!',
						className
					)}
					{...props}
				>
					{items.map((item) => (
						<Link
							key={item.href}
							to={item.href}
							className={cn(
								buttonVariants({ variant: 'ghost' }),
								location.pathname === item.href
									? 'bg-muted! hover:bg-muted!'
									: 'hover:bg-transparent! hover:underline!',
								'justify-start!'
							)}
						>
							<span className="mr-2!">{item.icon}</span>
							{item.title}
						</Link>
					))}
				</nav>
			</ScrollArea>
		</>
	);
}

SidebarNav.propTypes = {
	className: PropTypes.string,
	items: PropTypes.arrayOf(
		PropTypes.shape({
			href: PropTypes.string.isRequired,
			title: PropTypes.string.isRequired,
			icon: PropTypes.node.isRequired,
		})
	).isRequired,
};
