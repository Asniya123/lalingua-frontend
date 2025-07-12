import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/lib";

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children?: ReactNode;
  className?: string;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(({ className, children, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full border-collapse bg-white text-sm text-gray-700", className)}
      {...props}
    >
      {children}
    </table>
  </div>
));
Table.displayName = "Table";

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children?: ReactNode;
  className?: string;
}

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(({ className, children, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("bg-gray-50", className)}
    {...props}
  >
    {children}
  </thead>
));
TableHeader.displayName = "TableHeader";

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children?: ReactNode;
  className?: string;
}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(({ className, children, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("", className)}
    {...props}
  >
    {children}
  </tbody>
));
TableBody.displayName = "TableBody";

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children?: ReactNode;
  className?: string;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(({ className, children, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn("border-b border-gray-200 hover:bg-orange-50", className)}
    {...props}
  >
    {children}
  </tr>
));
TableRow.displayName = "TableRow";

interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
  className?: string;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(({ className, children, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "px-4 py-3 text-left font-medium text-gray-600 uppercase tracking-wider",
      className
    )}
    {...props}
  >
    {children}
  </th>
));
TableHead.displayName = "TableHead";

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
  className?: string;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(({ className, children, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-4 py-3", className)}
    {...props}
  >
    {children}
  </td>
));
TableCell.displayName = "TableCell";