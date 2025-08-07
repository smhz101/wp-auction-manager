import { useEffect } from 'react'
import { useSubmenu } from '@/context/submenu-context'

export default function Bids() {
  const { highlightSubmenu } = useSubmenu()

  useEffect(() => {
    highlightSubmenu('/bids')
  }, [highlightSubmenu])

  return <div>Bids page content</div>
}