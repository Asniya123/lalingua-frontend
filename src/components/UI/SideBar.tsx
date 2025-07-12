import {
  ReactNode,
  HTMLAttributes,
  ButtonHTMLAttributes,
  forwardRef,
  ElementType,
  Ref,
  createContext,
  useContext,
  useState,
} from "react";
import { cn } from "../../utils/lib";

interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  variant?: "inset" | "floating";
}

// Sidebar Context for managing collapsible state
interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};
SidebarProvider.displayName = "SidebarProvider";

export const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(({ className, children, variant = "inset", ...props }, ref) => {
  const { isCollapsed } = useContext(SidebarContext) || { isCollapsed: false };
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-screen flex-col bg-white shadow-lg transition-all duration-300",
        variant === "inset" ? "fixed top-0 left-0" : "relative",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Sidebar.displayName = "Sidebar";

export const SidebarHeader = forwardRef<HTMLDivElement, SidebarProps>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border-b border-gray-200 p-4", className)}
    {...props}
  >
    {children}
  </div>
));
SidebarHeader.displayName = "SidebarHeader";

export const SidebarContent = forwardRef<HTMLDivElement, SidebarProps>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto p-4", className)}
    {...props}
  >
    {children}
  </div>
));
SidebarContent.displayName = "SidebarContent";

export const SidebarGroup = forwardRef<HTMLDivElement, SidebarProps>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-4", className)}
    {...props}
  >
    {children}
  </div>
));
SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupContent = forwardRef<HTMLDivElement, SidebarProps>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-2", className)}
    {...props}
  >
    {children}
  </div>
));
SidebarGroupContent.displayName = "SidebarGroupContent";

export const SidebarGroupLabel = forwardRef<HTMLDivElement, SidebarProps>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-2 py-1 text-sm font-semibold text-gray-600 uppercase", className)}
    {...props}
  >
    {children}
  </div>
));
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export const SidebarMenu = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(
  ({ className, children, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("space-y-1", className)}
      {...props}
    >
      {children}
    </ul>
  )
);
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = forwardRef<HTMLLIElement, HTMLAttributes<HTMLLIElement>>(
  ({ className, children, ...props }, ref) => (
    <li
      ref={ref}
      className={cn("", className)}
      {...props}
    >
      {children}
    </li>
  )
);
SidebarMenuItem.displayName = "SidebarMenuItem";

interface SidebarMenuButtonProps extends HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
}

export const SidebarMenuButton = forwardRef<HTMLElement, SidebarMenuButtonProps>(
  ({ className, asChild, isActive, size = "md", children, ...props }, ref) => {
    const Comp: ElementType = asChild ? "div" : "button";
    const sizeStyles = {
      sm: "px-2 py-1 text-sm",
      md: "px-3 py-2 text-base",
      lg: "px-4 py-3 text-base",
    };

    return (
      <Comp
        ref={ref as Ref<HTMLElement>}
        className={cn(
          "w-full flex items-center gap-2 text-left",
          isActive ? "bg-orange-100 text-orange-600" : "text-orange-500 hover:bg-orange-50 hover:text-orange-600",
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarFooter = forwardRef<HTMLDivElement, SidebarProps>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border-t border-gray-200 p-4", className)}
    {...props}
  >
    {children}
  </div>
));
SidebarFooter.displayName = "SidebarFooter";

export const SidebarRail = forwardRef<HTMLDivElement, SidebarProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-1 bg-gray-200", className)}
    {...props}
  />
));
SidebarRail.displayName = "SidebarRail";

export const SidebarInset = forwardRef<HTMLDivElement, SidebarProps>(({ className, children, ...props }, ref) => {
  const { isCollapsed } = useContext(SidebarContext) || { isCollapsed: false };

  return (
    <div
      ref={ref}
      className={cn(
        "flex-1 h-screen overflow-y-auto transition-all duration-300",
        isCollapsed ? "ml-16" : "ml-64",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarInset.displayName = "SidebarInset";

interface SidebarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useContext(SidebarContext) || { toggleSidebar: () => {} };

    return (
      <button
        ref={ref}
        className={cn(
          "p-2 text-orange-500 hover:bg-orange-50 hover:text-orange-600 rounded-md",
          className
        )}
        onClick={toggleSidebar}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger";