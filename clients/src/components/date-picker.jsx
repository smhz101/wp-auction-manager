import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

export function DatePicker({
	selected,
	onSelect,
	placeholder = 'Pick a date',
}) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					data-empty={!selected}
					className="data-[empty=true]:text-muted-foreground w-[240px] justify-start text-left font-normal"
				>
					{selected ? (
						format(selected, 'MMM d, yyyy')
					) : (
						<span>{placeholder}</span>
					)}
					<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Calendar
					mode="single"
					captionLayout="dropdown"
					selected={selected}
					onSelect={onSelect}
					disabled={(date) =>
						date > new Date() || date < new Date('1900-01-01')
					}
				/>
			</PopoverContent>
		</Popover>
	);
}

DatePicker.propTypes = {
	selected: PropTypes.instanceOf(Date),
	onSelect: PropTypes.func.isRequired,
	placeholder: PropTypes.string,
};
