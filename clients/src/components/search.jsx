import PropTypes from 'prop-types';
import { IconSearch } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useSearch } from '@/context/search-context';
import { Button } from './ui/button';

export function Search({ className = '', placeholder = 'Search' }) {
	const { setOpen } = useSearch();

	return (
		<Button
			variant="outline"
                        className={cn(
                                'tw-bg-muted/25 tw-text-muted-foreground hover:tw-bg-muted/50 tw-relative tw-h-8 tw-w-full tw-flex-1 tw-justify-start tw-rounded-md tw-text-sm tw-font-normal tw-shadow-none sm:tw-pr-12 md:tw-w-40 md:tw-flex-none lg:tw-w-56 xl:tw-w-64',
                                className
                        )}
			onClick={() => setOpen(true)}
		>
			<IconSearch
				aria-hidden="true"
                                className="tw-absolute tw-top-1/2 tw-left-1.5 tw--translate-y-1/2"
			/>
                        <span className="tw-ml-3">{placeholder}</span>
                        <kbd className="tw-bg-muted tw-pointer-events-none tw-absolute tw-top-[0.3rem] tw-right-[0.3rem] tw-hidden tw-h-5 tw-items-center tw-gap-1 tw-rounded tw-border tw-px-1.5 tw-font-mono tw-text-[10px] tw-font-medium tw-opacity-100 tw-select-none sm:tw-flex">
                                <span className="tw-text-xs">⌘</span>K
			</kbd>
		</Button>
	);
}

Search.propTypes = {
	className: PropTypes.string,
	placeholder: PropTypes.string,
};
