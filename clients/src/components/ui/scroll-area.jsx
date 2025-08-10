import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

import { cn } from '@/lib/utils';

function ScrollArea({ className, children, ...props }) {
	return (
		<ScrollAreaPrimitive.Root
			data-slot="scroll-area"
                        className={cn('tw-relative', className)}
			{...props}
		>
			<ScrollAreaPrimitive.Viewport
				data-slot="scroll-area-viewport"
                                className="focus-visible:tw-ring-ring/50! tw-size-full! tw-rounded-[inherit]! tw-transition-[color,box-shadow]! tw-outline-none! focus-visible:tw-ring-[3px]! focus-visible:tw-outline-1!"
			>
				{children}
			</ScrollAreaPrimitive.Viewport>
			<ScrollBar />
			<ScrollAreaPrimitive.Corner />
		</ScrollAreaPrimitive.Root>
	);
}

function ScrollBar({ className, orientation = 'vertical', ...props }) {
	return (
		<ScrollAreaPrimitive.ScrollAreaScrollbar
			data-slot="scroll-area-scrollbar"
			orientation={orientation}
			className={cn(
                                'tw-flex! tw-touch-none! tw-p-px! tw-transition-colors! tw-select-none! tw-bg-background!',
				orientation === 'vertical' &&
                                        'tw-h-full! tw-w-2.5! tw-border-l! tw-border-l-transparent!',
				orientation === 'horizontal' &&
                                        'tw-h-2.5! tw-flex-col! tw-border-t! tw-border-t-transparent!',
				className
			)}
			{...props}
		>
			<ScrollAreaPrimitive.ScrollAreaThumb
				data-slot="scroll-area-thumb"
                                className="tw-bg-border! tw-relative! tw-flex-1! tw-rounded-full!"
			/>
		</ScrollAreaPrimitive.ScrollAreaScrollbar>
	);
}

export { ScrollArea, ScrollBar };
