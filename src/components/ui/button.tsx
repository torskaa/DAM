import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-charcoal text-white hover:bg-black shadow-xs",
      ghost: "hover:bg-black/5 hover:text-charcoal text-stone",
      outline: "border border-black/[0.08] bg-white hover:bg-paper-warmth text-charcoal",
      secondary: "bg-paper-warmth text-charcoal hover:bg-black/5",
    };

    const sizeStyles = {
      default: "h-9 px-4 py-2 text-xs",
      sm: "h-8 px-3 text-xs",
      lg: "h-10 px-6 text-sm",
      icon: "h-9 w-9",
    };

    const classes = cn(
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer rounded-[8px]",
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(classes, (children as React.ReactElement<any>).props.className),
        ref,
        ...props,
      });
    }

    return (
      <button className={classes} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
