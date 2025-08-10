import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { IconMenu } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function TopNav({ className, links, ...props }) {
  return (
    <>
      {/* Mobile Menu */}
      <div className='md:tw-hidden'>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size='icon' variant='outline'>
              <IconMenu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side='bottom' align='start'>
            {links.map(({ title, href, isActive, disabled }) => (
              <DropdownMenuItem key={`${title}-${href}`} asChild>
                {/* react-router-dom Link doesn't support `disabled`, use className only */}
                <Link
                  to={href}
                  className={cn(
                    !isActive && 'tw-text-muted-foreground',
                    disabled && 'tw-pointer-events-none tw-opacity-50'
                  )}
                >
                  {title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Nav */}
      <nav
        className={cn(
          'tw-hidden tw-items-center tw-space-x-4 md:tw-flex lg:tw-space-x-6',
          className
        )}
        {...props}
      >
        {links.map(({ title, href, isActive, disabled }) => (
          <Link
            key={`${title}-${href}`}
            to={href}
            className={cn(
              'hover:tw-text-primary tw-text-sm tw-font-medium tw-transition-colors',
              !isActive && 'tw-text-muted-foreground',
              disabled && 'tw-pointer-events-none tw-opacity-50'
            )}
          >
            {title}
          </Link>
        ))}
      </nav>
    </>
  )
}

TopNav.propTypes = {
  className: PropTypes.string,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      isActive: PropTypes.bool.isRequired,
      disabled: PropTypes.bool,
    })
  ).isRequired,
}