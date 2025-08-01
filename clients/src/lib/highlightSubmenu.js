export default function highlightSubmenu(path) {
  const menuRoot = document.querySelector('#toplevel_page_wpam-auctions');
  if (!menuRoot) return;

  if (!menuRoot.querySelector('.wp-submenu')) {
    const ul = document.createElement('ul');
    ul.className = 'wp-submenu wp-submenu-wrap';

    const items = [
      { label: 'All Auctions', path: '/all-auctions' },
      { label: 'Bids', path: '/bids' },
      { label: 'Messages', path: '/messages' },
      { label: 'Logs', path: '/logs' },
      { label: 'Flagged Users', path: '/flagged-users' },
      { label: 'Settings', path: '/settings' },
    ];

    const head = document.createElement('li');
    head.className = 'wp-submenu-head';
    head.innerText = 'Auctions';
    ul.appendChild(head);

    items.forEach((item, index) => {
      const li = document.createElement('li');
      if (index === 0) li.classList.add('wp-first-item');

      const a = document.createElement('a');
      a.href = `admin.php?page=wpam-auctions&path=${item.path}`;
      a.textContent = item.label;

      li.appendChild(a);
      ul.appendChild(li);
    });

    menuRoot.appendChild(ul);
  }

  menuRoot.querySelectorAll('li').forEach((li) => li.classList.remove('current'));
  const active = menuRoot.querySelector(`a[href*="path=${path}"]`);
  if (active && active.parentElement) {
    active.parentElement.classList.add('current');
    menuRoot.classList.add('wp-has-current-submenu', 'wp-menu-open');
  }
}
