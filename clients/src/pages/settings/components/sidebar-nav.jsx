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
                        <div className="tw-p-1! md:tw-hidden!">
				<Select value={val} onValueChange={handleSelect}>
                                        <SelectTrigger className="tw-h-12! sm:tw-w-48!">
						<SelectValue placeholder="Select a section" />
					</SelectTrigger>
					<SelectContent>
						{items.map((item) => (
							<SelectItem key={item.href} value={item.href}>
                                                                <div className="tw-flex! tw-gap-x-4! tw-px-2! tw-py-1!">
                                                                        <span className="tw-scale-125!">
										{item.icon}
									</span>
                                                                        <span className="tw-text-md!">
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
                                className="tw-bg-background! tw-hidden! tw-w-full! tw-min-w-40! tw-px-1! tw-py-2! md:tw-block!"
			>
				<nav
					className={cn(
                                                'tw-flex! tw-space-x-2! tw-py-1! lg:tw-flex-col! lg:tw-space-y-1! lg:tw-space-x-0!',
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
                                                                        ? 'tw-bg-muted! hover:tw-bg-muted!'
                                                                        : 'hover:tw-bg-transparent! hover:tw-underline!',
                                                                'tw-justify-start!'
							)}
						>
                                                        <span className="tw-mr-2!">{item.icon}</span>
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
