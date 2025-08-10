import PropTypes from 'prop-types'
import React, { createContext, useContext } from 'react'

const SubmenuContext = createContext()

export const SubmenuProvider = ({ children, items }) => {
  const highlightSubmenu = (path) => {
    const menuRoot = document.querySelector('#toplevel_page_wpam-auctions')
    if (!menuRoot) return

    if (!menuRoot.querySelector('.wp-submenu')) {
      const ul = document.createElement('ul')
      ul.className = 'wp-submenu wp-submenu-wrap'

      const head = document.createElement('li')
      head.className = 'wp-submenu-head'
      head.innerText = 'Auctions'
      ul.appendChild(head)

      items.forEach((item, index) => {
        const li = document.createElement('li')
        if (index === 0) li.classList.add('wp-first-item')

        const a = document.createElement('a')
        a.href = `admin.php?page=wpam-auctions&path=${item.path}`
        a.textContent = item.label

        li.appendChild(a)
        ul.appendChild(li)
      })

      menuRoot.appendChild(ul)
    }

    menuRoot.querySelectorAll('li').forEach((li) =>
      li.classList.remove('current')
    )
    const active = menuRoot.querySelector(`a[href*="path=${path}"]`)
    if (active?.parentElement) {
      active.parentElement.classList.add('current')
      menuRoot.classList.add('wp-has-current-submenu', 'wp-menu-open')
    }
  }

  return (
    <SubmenuContext.Provider value={{ highlightSubmenu }}>
      {children}
    </SubmenuContext.Provider>
  )
}

SubmenuProvider.propTypes = {
  children: PropTypes.node.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    })
  ).isRequired,
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSubmenu = () => {
  const context = useContext(SubmenuContext)
  if (!context) {
    throw new Error('useSubmenu must be used within a <SubmenuProvider>')
  }
  return context
}
