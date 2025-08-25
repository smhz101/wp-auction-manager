import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import aspectRatio from '@tailwindcss/aspect-ratio';

export default {
	content: ['./**/*.php', './index.html', './src/**/*.{js,jsx,ts,tsx}'],
	darkMode: 'class',
	important: '#wpam-auctions-root',
	plugins: [forms, typography, aspectRatio],
};
