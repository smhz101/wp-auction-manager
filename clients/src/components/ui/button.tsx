import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-wp-1 whitespace-nowrap rounded-sm font-sans text-wp-base font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-wp-blue",
  {
    variants: {
      variant: {
        default:
          "bg-wp-blue text-wp-white shadow-sm hover:bg-wp-blue-dark",
        destructive:
          "bg-wp-red text-wp-white shadow-sm hover:bg-wp-red/90 focus-visible:ring-wp-red/20",
        outline:
          "border border-wp-gray-300 bg-wp-white text-wp-gray-900 shadow-sm hover:bg-wp-gray-100",
        secondary:
          "bg-wp-gray-100 text-wp-gray-900 shadow-sm hover:bg-wp-gray-300",
        ghost:
          "text-wp-gray-900 hover:bg-wp-gray-100",
        link: "text-wp-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[40px] px-wp-2 py-wp-1 has-[>svg]:px-wp-1.5",
        sm: "h-[32px] rounded-sm gap-wp-0.5 px-wp-1.5 has-[>svg]:px-wp-1",
        lg: "h-[48px] rounded-sm px-wp-3 has-[>svg]:px-wp-2",
        icon: "size-[40px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
