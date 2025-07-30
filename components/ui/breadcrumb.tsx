import * as React from &quot;react&quot;;
import { Slot } from &quot;@radix-ui/react-slot&quot;;
import { ChevronRight } from &quot;lucide-react&quot;;

import { cn } from &quot;@/lib/utils&quot;;

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    aria-label=&quot;breadcrumb&quot;
    className={cn(&quot;inline-flex items-center space-x-2 text-sm&quot;, className)}
    {...props}
  />
));
Breadcrumb.displayName = &quot;Breadcrumb&quot;;

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.OlHTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(&quot;inline-flex items-center space-x-2&quot;, className)}
    {...props}
  />
));
BreadcrumbList.displayName = &quot;BreadcrumbList&quot;;

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn(&quot;inline-flex items-center&quot;, className)}
    {...props}
  />
));
BreadcrumbItem.displayName = &quot;BreadcrumbItem&quot;;

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    asChild?: boolean;
  }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : &quot;a&quot;;
  return (
    <Comp
      ref={ref}
      className={cn(&quot;hover:text-muted-foreground transition-colors&quot;, className)}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = &quot;BreadcrumbLink&quot;;

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    aria-hidden=&quot;true&quot;
    className={cn(&quot;text-muted-foreground&quot;, className)}
    {...props}
  >
    {children || <ChevronRight className=&quot;h-4 w-4&quot; />}
  </span>
);
BreadcrumbSeparator.displayName = &quot;BreadcrumbSeparator&quot;;

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    role=&quot;presentation&quot;
    aria-hidden=&quot;true&quot;
    className={cn(&quot;flex h-9 w-9 items-center justify-center&quot;, className)}
    {...props}
  >
    …
  </span>
);
BreadcrumbEllipsis.displayName = &quot;BreadcrumbElipssis&quot;;

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
