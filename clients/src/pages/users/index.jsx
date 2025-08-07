import { useEffect } from 'react'
import { useSubmenu } from '@/context/submenu-context'

export default function Users() {
  const { highlightSubmenu } = useSubmenu()

  useEffect(() => {
    highlightSubmenu('/users')
  }, [highlightSubmenu])

  return <div>Users page content</div>
}