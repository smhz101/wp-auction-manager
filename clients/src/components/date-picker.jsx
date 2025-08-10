import PropTypes from 'prop-types'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function DatePicker({ selected, onSelect, placeholder = 'Pick a date' }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          data-empty={!selected}
          className='data-[empty=true]:tw-text-muted-foreground tw-w-[240px] tw-justify-start tw-text-left tw-font-normal'
        >
          {selected ? (
            format(selected, 'MMM d, yyyy')
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className='tw-ml-auto tw-h-4 tw-w-4 tw-opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='tw-w-auto tw-p-0'>
        <Calendar
          mode='single'
          captionLayout='dropdown'
          selected={selected}
          onSelect={onSelect}
          disabled={(date) =>
            date > new Date() || date < new Date('1900-01-01')
          }
        />
      </PopoverContent>
    </Popover>
  )
}

DatePicker.propTypes = {
  selected: PropTypes.instanceOf(Date),
  onSelect: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
}