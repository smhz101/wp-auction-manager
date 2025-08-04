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
        "wp-:border-input wp-:data-[placeholder]:text-muted-foreground wp-:[&_svg:not([class*=text-])]:text-muted-foreground wp-:focus-visible:border-ring wp-:focus-visible:ring-ring/50 wp-:aria-invalid:ring-destructive/20 wp-:dark:aria-invalid:ring-destructive/40 wp-:aria-invalid:border-destructive wp-:dark:bg-input/30 wp-:dark:hover:bg-input/50 wp-:flex wp-:w-fit wp-:items-center wp-:justify-between wp-:gap-2 wp-:rounded-md wp-:border wp-:bg-transparent wp-:px-3 wp-:py-2 wp-:text-sm wp-:whitespace-nowrap wp-:shadow-xs wp-:transition-[color,box-shadow] wp-:outline-none wp-:focus-visible:ring-[3px] wp-:disabled:cursor-not-allowed wp-:disabled:opacity-50 wp-:data-[size=default]:h-9 wp-:data-[size=sm]:h-8 wp-:*:data-[slot=select-value]:line-clamp-1 wp-:*:data-[slot=select-value]:flex wp-:*:data-[slot=select-value]:items-center wp-:*:data-[slot=select-value]:gap-2 wp-:[&_svg]:pointer-events-none wp-:[&_svg]:shrink-0 wp-:[&_svg:not([class*=size-])]:size-4",
        className
      )}
      {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="wp-:size-4 wp-:opacity-50" />
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
          "wp-:bg-popover wp-:text-popover-foreground wp-:data-[state=open]:animate-in wp-:data-[state=closed]:animate-out wp-:data-[state=closed]:fade-out-0 wp-:data-[state=open]:fade-in-0 wp-:data-[state=closed]:zoom-out-95 wp-:data-[state=open]:zoom-in-95 wp-:data-[side=bottom]:slide-in-from-top-2 wp-:data-[side=left]:slide-in-from-right-2 wp-:data-[side=right]:slide-in-from-left-2 wp-:data-[side=top]:slide-in-from-bottom-2 wp-:relative wp-:z-50 wp-:max-h-(--radix-select-content-available-height) wp-:min-w-[8rem] wp-:origin-(--radix-select-content-transform-origin) wp-:overflow-x-hidden wp-:overflow-y-auto wp-:rounded-md wp-:border wp-:shadow-md",
          position === "popper" &&
            "wp-:data-[side=bottom]:translate-y-1 wp-:data-[side=left]:-translate-x-1 wp-:data-[side=right]:translate-x-1 wp-:data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}>
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn("wp-:p-1", position === "popper" &&
            "wp-:h-[var(--radix-select-trigger-height)] wp-:w-full wp-:min-w-[var(--radix-select-trigger-width)] wp-:scroll-my-1")}>
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
      className={cn("wp-:text-muted-foreground wp-:px-2 wp-:py-1.5 wp-:text-xs", className)}
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
        "wp-:focus:bg-accent wp-:focus:text-accent-foreground wp-:[&_svg:not([class*=text-])]:text-muted-foreground wp-:relative wp-:flex wp-:w-full wp-:cursor-default wp-:items-center wp-:gap-2 wp-:rounded-sm wp-:py-1.5 wp-:pr-8 wp-:pl-2 wp-:text-sm wp-:outline-hidden wp-:select-none wp-:data-[disabled]:pointer-events-none wp-:data-[disabled]:opacity-50 wp-:[&_svg]:pointer-events-none wp-:[&_svg]:shrink-0 wp-:[&_svg:not([class*=size-])]:size-4 wp-:*:[span]:last:flex wp-:*:[span]:last:items-center wp-:*:[span]:last:gap-2",
        className
      )}
      {...props}>
      <span
        className="wp-:absolute wp-:right-2 wp-:flex wp-:size-3.5 wp-:items-center wp-:justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="wp-:size-4" />
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
      className={cn(
        "wp-:bg-border wp-:pointer-events-none wp-:-mx-1 wp-:my-1 wp-:h-px",
        className
      )}
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
      className={cn(
        "wp-:flex wp-:cursor-default wp-:items-center wp-:justify-center wp-:py-1",
        className
      )}
      {...props}>
      <ChevronUpIcon className="wp-:size-4" />
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
      className={cn(
        "wp-:flex wp-:cursor-default wp-:items-center wp-:justify-center wp-:py-1",
        className
      )}
      {...props}>
      <ChevronDownIcon className="wp-:size-4" />
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
