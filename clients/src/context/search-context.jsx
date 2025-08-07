import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';
import { CommandMenu } from '@/components/command-menu';

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const down = (e) => {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener('keydown', down);
		return () => document.removeEventListener('keydown', down);
	}, []);

	return (
		<SearchContext.Provider value={{ open, setOpen }}>
			{children}
			<CommandMenu />
		</SearchContext.Provider>
	);
}

SearchProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSearch = () => {
	const context = useContext(SearchContext);

	if (!context) {
		throw new Error('useSearch must be used within <SearchProvider>');
	}

	return context;
};
