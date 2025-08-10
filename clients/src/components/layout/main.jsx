import { cn } from '@/lib/utils';
import PropTypes from 'prop-types';

export const Main = ({ fixed, className, ...props }) => {
	return (
		<main
			className={cn(
				'peer-[.header-fixed]/header:mt-16',
				'px-4 py-6',
				fixed && 'fixed-main flex grow flex-col overflow-hidden',
				className
			)}
			{...props}
		/>
	);
};

Main.displayName = 'Main';

Main.propTypes = {
	fixed: PropTypes.bool,
	className: PropTypes.string,
};
