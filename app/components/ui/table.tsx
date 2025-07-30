import * as React from &quot;react&quot;;

import { cn } from &quot;../../lib/utils&quot;;

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className=&quot;relative w-full overflow-auto&quot;>
    <table
      ref={ref}
      className={cn(&quot;w-full caption-bottom text-sm&quot;, className)}
      {...props}
    />
  </div>
));
Table.displayName = &quot;Table&quot;;

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn(&quot;[&_tr]:border-b&quot;, className)} {...props} />
));
TableHeader.displayName = &quot;TableHeader&quot;;

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(&quot;[&_tr:last-child]:border-0&quot;, className)}
    {...props}
  />
));
TableBody.displayName = &quot;TableBody&quot;;

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      &quot;border-t bg-muted/50 font-medium [&>tr]:last:border-b-0&quot;,
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = &quot;TableFooter&quot;;

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      &quot;border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted&quot;,
      className,
    )}
    {...props}
  />
));
TableRow.displayName = &quot;TableRow&quot;;

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      &quot;h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0&quot;,
      className,
    )}
    {...props}
  />
));
TableHead.displayName = &quot;TableHead&quot;;

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(&quot;p-4 align-middle [&:has([role=checkbox])]:pr-0&quot;, className)}
    {...props}
  />
));
TableCell.displayName = &quot;TableCell&quot;;

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn(&quot;mt-4 text-sm text-muted-foreground&quot;, className)}
    {...props}
  />
));
TableCaption.displayName = &quot;TableCaption&quot;;

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
