import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ReactNode, forwardRef } from "react";
import { cn } from "../../utils/lib"; // Adjust path to your utils file

// DropdownMenu: Root component for the dropdown menu
export const DropdownMenu = DropdownMenuPrimitive.Root;

// DropdownMenuTrigger: Trigger element to open/close the dropdown
interface DropdownMenuTriggerProps extends DropdownMenuPrimitive.DropdownMenuTriggerProps {
  asChild?: boolean;
  className?: string;
}

export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, asChild, children, ...props }, ref) => (
    <DropdownMenuPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex items-center gap-2 text-left focus:outline-none",
        className
      )}
      asChild={asChild}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Trigger>
  )
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

// DropdownMenuContent: Container for dropdown menu items
interface DropdownMenuContentProps extends DropdownMenuPrimitive.DropdownMenuContentProps {
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, side, align, sideOffset = 0, children, ...props }, ref) => (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  )
);
DropdownMenuContent.displayName = "DropdownMenuContent";

// DropdownMenuItem: Individual item in the dropdown menu
interface DropdownMenuItemProps extends DropdownMenuPrimitive.DropdownMenuItemProps {
  className?: string;
}

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none",
        "text-orange-500 hover:bg-orange-100 hover:text-orange-600 focus:bg-orange-100 focus:text-orange-600",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  )
);
DropdownMenuItem.displayName = "DropdownMenuItem";

// DropdownMenuLabel: Label for the dropdown menu
interface DropdownMenuLabelProps extends DropdownMenuPrimitive.DropdownMenuLabelProps {
  className?: string;
}

export const DropdownMenuLabel = forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn("px-2 py-1.5 text-sm font-semibold text-gray-700", className)}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Label>
  )
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

// DropdownMenuSeparator: Separator line between dropdown items
interface DropdownMenuSeparatorProps extends DropdownMenuPrimitive.DropdownMenuSeparatorProps {
  className?: string;
}

export const DropdownMenuSeparator = forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-gray-200", className)}
      {...props}
    />
  )
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";