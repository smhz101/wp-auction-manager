import { useEffect } from 'react'
import { useSubmenu } from '@/context/submenu-context'

export default function Auctions() {
  const { highlightSubmenu } = useSubmenu()

  useEffect(() => {
    highlightSubmenu('/all-auctions')
  }, [highlightSubmenu])

  return <div>Auctions page content</div>
}