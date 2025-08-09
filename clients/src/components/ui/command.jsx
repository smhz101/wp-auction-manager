import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function Command({
  className,
  ...props
}) {
  return (
    (<CommandPrimitive
      data-slot="command"
      className={cn(
        "tw-bg-popover tw-text-popover-foreground tw-flex tw-h-full tw-w-full tw-flex-col tw-overflow-hidden tw-rounded-md",
        className
      )}
      {...props} />)
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  ...props
}) {
  return (
    (<Dialog {...props}>
      <DialogHeader className="tw-sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("tw-overflow-hidden tw-p-0", className)}
        showCloseButton={showCloseButton}>
        <Command
          className="[&_[cmdk-group-heading]]:tw-text-muted-foreground **:data-[slot=command-input-wrapper]:tw-h-12 [&_[cmdk-group-heading]]:tw-px-2 [&_[cmdk-group-heading]]:tw-font-medium [&_[cmdk-group]]:tw-px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:tw-pt-0 [&_[cmdk-input-wrapper]_svg]:tw-h-5 [&_[cmdk-input-wrapper]_svg]:tw-w-5 [&_[cmdk-input]]:tw-h-12 [&_[cmdk-item]]:tw-px-2 [&_[cmdk-item]]:tw-py-3 [&_[cmdk-item]_svg]:tw-h-5 [&_[cmdk-item]_svg]:tw-w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>)
  );
}

function CommandInput({
  className,
  ...props
}) {
  return (
    (<div
      data-slot="command-input-wrapper"
      className="tw-flex tw-h-9 tw-items-center tw-gap-2 tw-border-b tw-px-3">
      <SearchIcon className="tw-size-4 tw-shrink-0 tw-opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
          className={cn(
          "placeholder:tw-text-muted-foreground tw-flex tw-h-10 tw-w-full tw-rounded-md tw-bg-transparent tw-py-3 tw-text-sm tw-outline-hidden disabled:tw-cursor-not-allowed disabled:tw-opacity-50",
          className
        )}
        {...props} />
    </div>)
  );
}

function CommandList({
  className,
  ...props
}) {
  return (
    (<CommandPrimitive.List
      data-slot="command-list"
      className={cn("tw-max-h-[300px] tw-scroll-py-1 tw-overflow-x-hidden tw-overflow-y-auto", className)}
      {...props} />)
  );
}

function CommandEmpty({
  ...props
}) {
  return (<CommandPrimitive.Empty data-slot="command-empty" className="tw-py-6 tw-text-center tw-text-sm" {...props} />);
}

function CommandGroup({
  className,
  ...props
}) {
  return (
    (<CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "tw-text-foreground [&_[cmdk-group-heading]]:tw-text-muted-foreground tw-overflow-hidden tw-p-1 [&_[cmdk-group-heading]]:tw-px-2 [&_[cmdk-group-heading]]:tw-py-1.5 [&_[cmdk-group-heading]]:tw-text-xs [&_[cmdk-group-heading]]:tw-font-medium",
        className
      )}
      {...props} />)
  );
}

function CommandSeparator({
  className,
  ...props
}) {
  return (
    (<CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("tw-bg-border tw--mx-1 tw-h-px", className)}
      {...props} />)
  );
}

function CommandItem({
  className,
  ...props
}) {
  return (
    (<CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:tw-bg-accent data-[selected=true]:tw-text-accent-foreground [&_svg:not([class*='text-'])]:tw-text-muted-foreground tw-relative tw-flex tw-cursor-default tw-items-center tw-gap-2 tw-rounded-sm tw-px-2 tw-py-1.5 tw-text-sm tw-outline-hidden tw-select-none data-[disabled=true]:tw-pointer-events-none data-[disabled=true]:tw-opacity-50 [&_svg]:tw-pointer-events-none [&_svg]:tw-shrink-0 [&_svg:not([class*='size-'])]:tw-size-4",
        className
      )}
      {...props} />)
  );
}

function CommandShortcut({
  className,
  ...props
}) {
  return (
    (<span
      data-slot="command-shortcut"
      className={cn("tw-text-muted-foreground tw-ml-auto tw-text-xs tw-tracking-widest", className)}
      {...props} />)
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
