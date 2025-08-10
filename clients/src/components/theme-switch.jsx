import { useEffect } from 'react'
import { IconCheck, IconMoon, IconSun } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()

  // Update theme-color meta tag when theme changes
  useEffect(() => {
    const themeColor = theme === 'dark' ? '#020817' : '#fff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor)
    }
  }, [theme])

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='tw-scale-95 tw-rounded-full'>
          <IconSun className='tw-size-[1.2rem] tw-scale-100 tw-rotate-0 tw-transition-all dark:tw-scale-0 dark:tw--rotate-90' />
          <IconMoon className='tw-absolute tw-size-[1.2rem] tw-scale-0 tw-rotate-90 tw-transition-all dark:tw-scale-100 dark:tw-rotate-0' />
          <span className='tw-sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
          <IconCheck
            size={14}
            className={cn('tw-ml-auto', theme !== 'light' && 'tw-hidden')}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
          <IconCheck
            size={14}
            className={cn('tw-ml-auto', theme !== 'dark' && 'tw-hidden')}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
          <IconCheck
            size={14}
            className={cn('tw-ml-auto', theme !== 'system' && 'tw-hidden')}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
