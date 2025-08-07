import PropTypes from 'prop-types'
import { IconLoader } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { FormControl } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function SelectDropdown({
  defaultValue,
  onValueChange,
  isPending,
  items,
  placeholder,
  disabled,
  className = '',
  isControlled = false,
}) {
  const defaultState = isControlled
    ? { value: defaultValue, onValueChange }
    : { defaultValue, onValueChange }

  return (
    <Select {...defaultState}>
      <FormControl>
        <SelectTrigger disabled={disabled} className={cn(className)}>
          <SelectValue placeholder={placeholder ?? 'Select'} />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {isPending ? (
          <SelectItem disabled value='loading' className='h-14'>
            <div className='flex items-center justify-center gap-2'>
              <IconLoader className='h-5 w-5 animate-spin' />
              Loading...
            </div>
          </SelectItem>
        ) : (
          items?.map(({ label, value }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}

SelectDropdown.propTypes = {
  defaultValue: PropTypes.string,
  onValueChange: PropTypes.func,
  isPending: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  isControlled: PropTypes.bool,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ),
}
