import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button";

function Pagination({
  className,
  ...props
}) {
  return (
    (<nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("tw-mx-auto tw-flex tw-w-full tw-justify-center", className)}
      {...props} />)
  );
}

function PaginationContent({
  className,
  ...props
}) {
  return (
    (<ul
      data-slot="pagination-content"
      className={cn("tw-flex tw-flex-row tw-items-center tw-gap-1", className)}
      {...props} />)
  );
}

function PaginationItem({
  ...props
}) {
  return <li data-slot="pagination-item" {...props} />;
}

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}) {
  return (
    (<a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }), className)}
      {...props} />)
  );
}

function PaginationPrevious({
  className,
  ...props
}) {
  return (
    (<PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("tw-gap-1 tw-px-2.5 sm:tw-pl-2.5", className)}
      {...props}>
      <ChevronLeftIcon />
      <span className="tw-hidden sm:tw-block">Previous</span>
    </PaginationLink>)
  );
}

function PaginationNext({
  className,
  ...props
}) {
  return (
    (<PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("tw-gap-1 tw-px-2.5 sm:tw-pr-2.5", className)}
      {...props}>
      <span className="tw-hidden sm:tw-block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>)
  );
}

function PaginationEllipsis({
  className,
  ...props
}) {
  return (
    (<span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("tw-flex tw-size-9 tw-items-center tw-justify-center", className)}
      {...props}>
      <MoreHorizontalIcon className="tw-size-4" />
      <span className="tw-sr-only">More pages</span>
    </span>)
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
