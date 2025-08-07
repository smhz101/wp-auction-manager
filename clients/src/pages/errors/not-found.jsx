import { useEffect } from 'react'
import { useSubmenu } from '@/context/submenu-context'

export default function NotFound() {
  const { highlightSubmenu } = useSubmenu()

  useEffect(() => {
    highlightSubmenu('/all-auctions')
  }, [highlightSubmenu])

  return <h1>Not found</h1>
}