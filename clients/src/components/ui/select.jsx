import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Select({
  ...props
}) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return (
    (<SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "tw-border-input data-[placeholder]:tw-text-muted-foreground [&_svg:not([class*='text-'])]:tw-text-muted-foreground focus-visible:tw-border-ring focus-visible:tw-ring-ring/50 aria-invalid:tw-ring-destructive/20 dark:aria-invalid:tw-ring-destructive/40 aria-invalid:tw-border-destructive dark:tw-bg-input/30 dark:hover:tw-bg-input/50 tw-flex tw-w-fit tw-items-center tw-justify-between tw-gap-2 tw-rounded-md tw-border tw-bg-transparent tw-px-3 tw-py-2 tw-text-sm tw-whitespace-nowrap tw-shadow-xs tw-transition-[color,box-shadow] tw-outline-none focus-visible:tw-ring-[3px] disabled:tw-cursor-not-allowed disabled:tw-opacity-50 data-[size=default]:tw-h-9 data-[size=sm]:tw-h-8 *:data-[slot=select-value]:tw-line-clamp-1 *:data-[slot=select-value]:tw-flex *:data-[slot=select-value]:tw-items-center *:data-[slot=select-value]:tw-gap-2 [&_svg]:tw-pointer-events-none [&_svg]:tw-shrink-0 [&_svg:not([class*='size-'])]:tw-size-4",
        className
      )}
      {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="tw-size-4 tw-opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>)
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}) {
  return (
    (<SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "tw-bg-popover tw-text-popover-foreground data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=open]:tw-fade-in-0 data-[state=closed]:tw-zoom-out-95 data-[state=open]:tw-zoom-in-95 data-[side=bottom]:tw-slide-in-from-top-2 data-[side=left]:tw-slide-in-from-right-2 data-[side=right]:tw-slide-in-from-left-2 data-[side=top]:tw-slide-in-from-bottom-2 tw-relative tw-z-50 tw-max-h-(--radix-select-content-available-height) tw-min-w-[8rem] tw-origin-(--radix-select-content-transform-origin) tw-overflow-x-hidden tw-overflow-y-auto tw-rounded-md tw-border tw-shadow-md",
          position === "popper" &&
            "data-[side=bottom]:tw-translate-y-1 data-[side=left]:tw--translate-x-1 data-[side=right]:tw-translate-x-1 data-[side=top]:tw--translate-y-1",
          className
        )}
        position={position}
        {...props}>
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn("tw-p-1", position === "popper" &&
            "tw-h-[var(--radix-select-trigger-height)] tw-w-full tw-min-w-[var(--radix-select-trigger-width)] tw-scroll-my-1")}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>)
  );
}

function SelectLabel({
  className,
  ...props
}) {
  return (
    (<SelectPrimitive.Label
      data-slot="select-label"
      className={cn("tw-text-muted-foreground tw-px-2 tw-py-1.5 tw-text-xs", className)}
      {...props} />)
  );
}

function SelectItem({
  className,
  children,
  ...props
}) {
  return (
    (<SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:tw-bg-accent focus:tw-text-accent-foreground [&_svg:not([class*='text-'])]:tw-text-muted-foreground tw-relative tw-flex tw-w-full tw-cursor-default tw-items-center tw-gap-2 tw-rounded-sm tw-py-1.5 tw-pr-8 tw-pl-2 tw-text-sm tw-outline-hidden tw-select-none data-[disabled]:tw-pointer-events-none data-[disabled]:tw-opacity-50 [&_svg]:tw-pointer-events-none [&_svg]:tw-shrink-0 [&_svg:not([class*='size-'])]:tw-size-4 *:[span]:last:tw-flex *:[span]:last:tw-items-center *:[span]:last:tw-gap-2",
        className
      )}
      {...props}>
      <span className="tw-absolute tw-right-2 tw-flex tw-size-3.5 tw-items-center tw-justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="tw-size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>)
  );
}

function SelectSeparator({
  className,
  ...props
}) {
  return (
    (<SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("tw-bg-border tw-pointer-events-none tw--mx-1 tw-my-1 tw-h-px", className)}
      {...props} />)
  );
}

function SelectScrollUpButton({
  className,
  ...props
}) {
  return (
    (<SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("tw-flex tw-cursor-default tw-items-center tw-justify-center tw-py-1", className)}
      {...props}>
      <ChevronUpIcon className="tw-size-4" />
    </SelectPrimitive.ScrollUpButton>)
  );
}

function SelectScrollDownButton({
  className,
  ...props
}) {
  return (
    (<SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("tw-flex tw-cursor-default tw-items-center tw-justify-center tw-py-1", className)}
      {...props}>
      <ChevronDownIcon className="tw-size-4" />
    </SelectPrimitive.ScrollDownButton>)
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
