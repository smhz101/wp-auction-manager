export default function highlightSubmenu(path) {
  const menuRoot = document.querySelector('#toplevel_page_wpam-auctions');
  if (!menuRoot) return;

  const items = [
    { label: 'All Auctions', path: '/all-auctions' },
    { label: 'Bids', path: '/bids' },
    { label: 'Messages', path: '/messages' },
    { label: 'Logs', path: '/logs' },
    { label: 'Flagged Users', path: '/flagged-users' },
    { label: 'Settings', path: '/settings' },
  ];

  let submenu = menuRoot.querySelector('.wp-submenu');
  if (!submenu) {
    submenu = document.createElement('ul');
    submenu.className = 'wp-submenu wp-submenu-wrap';

    const head = document.createElement('li');
    head.className = 'wp-submenu-head';
    head.innerText = 'Auctions';
    submenu.appendChild(head);

    menuRoot.appendChild(submenu);
  }

  if (!submenu.querySelector(`a[href*="path=${items[0].path}"]`)) {
    items.forEach((item, index) => {
      const li = document.createElement('li');
      if (index === 0 && !submenu.querySelector('li.wp-first-item')) {
        li.classList.add('wp-first-item');
      }

      const a = document.createElement('a');
      a.href = `admin.php?page=wpam-auctions&path=${item.path}`;
      a.textContent = item.label;

      li.appendChild(a);
      submenu.appendChild(li);
    });
  }

  submenu.querySelectorAll('li').forEach((li) => li.classList.remove('current'));
  const active = submenu.querySelector(`a[href*="path=${path}"]`);
  if (active && active.parentElement) {
    active.parentElement.classList.add('current');
    menuRoot.classList.add('wp-has-current-submenu', 'wp-menu-open');
  }
}
