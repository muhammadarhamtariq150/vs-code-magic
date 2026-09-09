import { forwardRef, type ComponentProps } from "react";
import { Link, useLocation } from "@/lib/router-compat";
import { cn } from "@/lib/utils";

type NavLinkCompatProps = Omit<ComponentProps<typeof Link>, "className"> & {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  end?: boolean;
};

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, end, to, ...props }, ref) => {
    const { pathname } = useLocation();
    const target = String(to);
    const isActive = end ? pathname === target : pathname === target || pathname.startsWith(`${target}/`);

    return (
      <Link
        ref={ref}
        to={target}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
