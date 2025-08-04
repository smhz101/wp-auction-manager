import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function DropdownMenu({
  ...props
}) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}) {
  return (<DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />);
}

function DropdownMenuTrigger({
  ...props
}) {
  return (<DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />);
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}) {
  return (
    (<DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "wp-:bg-popover wp-:text-popover-foreground wp-:data-[state=open]:animate-in wp-:data-[state=closed]:animate-out wp-:data-[state=closed]:fade-out-0 wp-:data-[state=open]:fade-in-0 wp-:data-[state=closed]:zoom-out-95 wp-:data-[state=open]:zoom-in-95 wp-:data-[side=bottom]:slide-in-from-top-2 wp-:data-[side=left]:slide-in-from-right-2 wp-:data-[side=right]:slide-in-from-left-2 wp-:data-[side=top]:slide-in-from-bottom-2 wp-:z-50 wp-:max-h-(--radix-dropdown-menu-content-available-height) wp-:min-w-[8rem] wp-:origin-(--radix-dropdown-menu-content-transform-origin) wp-:overflow-x-hidden wp-:overflow-y-auto wp-:rounded-md wp-:border wp-:p-1 wp-:shadow-md",
          className
        )}
        {...props} />
    </DropdownMenuPrimitive.Portal>)
  );
}

function DropdownMenuGroup({
  ...props
}) {
  return (<DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />);
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return (
    (<DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "wp-:focus:bg-accent wp-:focus:text-accent-foreground wp-:data-[variant=destructive]:text-destructive wp-:data-[variant=destructive]:focus:bg-destructive/10 wp-:dark:data-[variant=destructive]:focus:bg-destructive/20 wp-:data-[variant=destructive]:focus:text-destructive wp-:data-[variant=destructive]:*:[svg]:!text-destructive wp-:[&_svg:not([class*=text-])]:text-muted-foreground wp-:relative wp-:flex wp-:cursor-default wp-:items-center wp-:gap-2 wp-:rounded-sm wp-:px-2 wp-:py-1.5 wp-:text-sm wp-:outline-hidden wp-:select-none wp-:data-[disabled]:pointer-events-none wp-:data-[disabled]:opacity-50 wp-:data-[inset]:pl-8 wp-:[&_svg]:pointer-events-none wp-:[&_svg]:shrink-0 wp-:[&_svg:not([class*=size-])]:size-4",
        className
      )}
      {...props} />)
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}) {
  return (
    (<DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "wp-:focus:bg-accent wp-:focus:text-accent-foreground wp-:relative wp-:flex wp-:cursor-default wp-:items-center wp-:gap-2 wp-:rounded-sm wp-:py-1.5 wp-:pr-2 wp-:pl-8 wp-:text-sm wp-:outline-hidden wp-:select-none wp-:data-[disabled]:pointer-events-none wp-:data-[disabled]:opacity-50 wp-:[&_svg]:pointer-events-none wp-:[&_svg]:shrink-0 wp-:[&_svg:not([class*=size-])]:size-4",
        className
      )}
      checked={checked}
      {...props}>
      <span
        className="wp-:pointer-events-none wp-:absolute wp-:left-2 wp-:flex wp-:size-3.5 wp-:items-center wp-:justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="wp-:size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>)
  );
}

function DropdownMenuRadioGroup({
  ...props
}) {
  return (<DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />);
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}) {
  return (
    (<DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "wp-:focus:bg-accent wp-:focus:text-accent-foreground wp-:relative wp-:flex wp-:cursor-default wp-:items-center wp-:gap-2 wp-:rounded-sm wp-:py-1.5 wp-:pr-2 wp-:pl-8 wp-:text-sm wp-:outline-hidden wp-:select-none wp-:data-[disabled]:pointer-events-none wp-:data-[disabled]:opacity-50 wp-:[&_svg]:pointer-events-none wp-:[&_svg]:shrink-0 wp-:[&_svg:not([class*=size-])]:size-4",
        className
      )}
      {...props}>
      <span
        className="wp-:pointer-events-none wp-:absolute wp-:left-2 wp-:flex wp-:size-3.5 wp-:items-center wp-:justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="wp-:size-2 wp-:fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>)
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}) {
  return (
    (<DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "wp-:px-2 wp-:py-1.5 wp-:text-sm wp-:font-medium wp-:data-[inset]:pl-8",
        className
      )}
      {...props} />)
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}) {
  return (
    (<DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("wp-:bg-border wp-:-mx-1 wp-:my-1 wp-:h-px", className)}
      {...props} />)
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}) {
  return (
    (<span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "wp-:text-muted-foreground wp-:ml-auto wp-:text-xs wp-:tracking-widest",
        className
      )}
      {...props} />)
  );
}

function DropdownMenuSub({
  ...props
}) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}) {
  return (
    (<DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "wp-:focus:bg-accent wp-:focus:text-accent-foreground wp-:data-[state=open]:bg-accent wp-:data-[state=open]:text-accent-foreground wp-:flex wp-:cursor-default wp-:items-center wp-:rounded-sm wp-:px-2 wp-:py-1.5 wp-:text-sm wp-:outline-hidden wp-:select-none wp-:data-[inset]:pl-8",
        className
      )}
      {...props}>
      {children}
      <ChevronRightIcon className="wp-:ml-auto wp-:size-4" />
    </DropdownMenuPrimitive.SubTrigger>)
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}) {
  return (
    (<DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "wp-:bg-popover wp-:text-popover-foreground wp-:data-[state=open]:animate-in wp-:data-[state=closed]:animate-out wp-:data-[state=closed]:fade-out-0 wp-:data-[state=open]:fade-in-0 wp-:data-[state=closed]:zoom-out-95 wp-:data-[state=open]:zoom-in-95 wp-:data-[side=bottom]:slide-in-from-top-2 wp-:data-[side=left]:slide-in-from-right-2 wp-:data-[side=right]:slide-in-from-left-2 wp-:data-[side=top]:slide-in-from-bottom-2 wp-:z-50 wp-:min-w-[8rem] wp-:origin-(--radix-dropdown-menu-content-transform-origin) wp-:overflow-hidden wp-:rounded-md wp-:border wp-:p-1 wp-:shadow-lg",
        className
      )}
      {...props} />)
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
