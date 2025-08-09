import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({
  ...props
}) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}) {
  return (
    (<AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("tw-border-b last:tw-border-b-0", className)}
      {...props} />)
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}) {
  return (
    (<AccordionPrimitive.Header className="tw-flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:tw-border-ring focus-visible:tw-ring-ring/50 tw-flex tw-flex-1 tw-items-start tw-justify-between tw-gap-4 tw-rounded-md tw-py-4 tw-text-left tw-text-sm tw-font-medium tw-transition-all tw-outline-none hover:tw-underline focus-visible:tw-ring-[3px] disabled:tw-pointer-events-none disabled:tw-opacity-50 [&[data-state=open]>svg]:tw-rotate-180",
          className
        )}
        {...props}>
        {children}
        <ChevronDownIcon
          className="tw-text-muted-foreground tw-pointer-events-none tw-size-4 tw-shrink-0 tw-translate-y-0.5 tw-transition-transform tw-duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>)
  );
}

function AccordionContent({
  className,
  children,
  ...props
}) {
  return (
    (<AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:tw-animate-accordion-up data-[state=open]:tw-animate-accordion-down tw-overflow-hidden tw-text-sm"
      {...props}>
      <div className={cn("tw-pt-0 tw-pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>)
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
