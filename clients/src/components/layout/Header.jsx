import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { IconGavel } from '@tabler/icons-react';

export const Header = ({ className, fixed, children, ...props }) => {
	const [offset, setOffset] = useState(0);

	useEffect(() => {
		const onScroll = () => {
			setOffset(
				document.body.scrollTop || document.documentElement.scrollTop
			);
		};

		// Add scroll listener to the body
		document.addEventListener('scroll', onScroll, { passive: true });

		// Clean up the event listener on unmount
		return () => document.removeEventListener('scroll', onScroll);
	}, []);

	return (
		<header
			className={cn(
				'bg-background flex h-16 items-center gap-3 p-4 sm:gap-4',
				fixed &&
					'header-fixed peer/header fixed z-50 w-[inherit] rounded-md',
				offset > 10 && fixed ? 'shadow-sm' : 'shadow-none',
				className
			)}
			{...props}
		>
			<h1 className="flex! text-base! font-extrabold! mt-0! pt-0! pb-0!">
				<IconGavel aria-hidden="true" className="mr-2!" />
				Auction Manager
			</h1>
			<Separator orientation="vertical" className="h-6!" />
			{children}
		</header>
	);
};

Header.displayName = 'Header';

Header.propTypes = {
	fixed: PropTypes.bool,
	className: PropTypes.string,
	children: PropTypes.node,
};
