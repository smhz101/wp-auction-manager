import { useEffect } from 'react'
import { useSubmenu } from '@/context/submenu-context'

export default function Messages() {
  const { highlightSubmenu } = useSubmenu()

  useEffect(() => {
    highlightSubmenu('/messages')
  }, [highlightSubmenu])

  return <div>Messages page content</div>
}