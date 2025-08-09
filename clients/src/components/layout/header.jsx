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
                                'tw-bg-background tw-flex tw-h-16 tw-items-center tw-gap-3 tw-p-4 sm:tw-gap-4',
                                fixed &&
                                        'header-fixed peer/header tw-fixed tw-z-50 tw-w-[inherit] tw-rounded-md',
                                offset > 10 && fixed ? 'tw-shadow-sm' : 'tw-shadow-none',
                                className
                        )}
			{...props}
		>
                        <h1 className="tw-flex! tw-text-base! tw-font-extrabold! tw-mt-0! tw-pt-0! tw-pb-0!">
                                <IconGavel aria-hidden="true" className="tw-mr-2!" />
				Auction Manager
			</h1>
                        <Separator orientation="vertical" className="tw-h-6!" />
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
