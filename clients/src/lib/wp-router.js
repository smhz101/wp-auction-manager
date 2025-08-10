// lib/wp-router.js
export function navigateWithPath(navigate, to) {
	const url = new URL(window.location.href);
	url.searchParams.set('path', to);
	window.history.pushState({}, '', url);
	navigate(to); // navigates within MemoryRouter
}
