import { ReactNode } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

interface BentoCardProps {
  name: string;
  className?: string;
  background?: ReactNode;
  Icon?: any;
  description: string;
  href?: string;
  cta?: string;
  onClick?: () => void;
  badge?: string;
}

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta = "Explore",
  onClick,
  badge,
}: BentoCardProps) => {
  const navigate = useNavigate();

  const handleAction = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    } else if (href && href.startsWith("/")) {
      e.preventDefault();
      navigate(href);
    }
  };

  return (
    <div
      key={name}
      onClick={onClick || (href ? handleAction : undefined)}
      className={cn(
        "group relative col-span-3 lg:col-span-1 flex flex-col justify-between overflow-hidden rounded-[14px] cursor-pointer transition-all duration-300",
        // surface & border tokens
        "bg-[var(--surface-card)] border border-[var(--border-card)] shadow-xs",
        // hover styling with token glow
        "hover:shadow-md hover:border-[var(--color-brand)]/40 hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="absolute inset-0 z-0 overflow-hidden">{background}</div>

      {badge && (
        <div className="absolute top-4 right-4 z-20 pointer-events-none">
          <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold font-mono bg-[var(--surface-card)]/90 backdrop-blur-xs text-[var(--text-primary)] border border-[var(--border-card)] shadow-xs">
            {badge}
          </span>
        </div>
      )}

      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1.5 p-6 transition-all duration-300 group-hover:-translate-y-8">
        {Icon && (
          <div className="w-12 h-12 rounded-[10px] bg-[var(--surface-subtle)] backdrop-blur-xs flex items-center justify-center border border-[var(--border-card)] mb-1">
            <Icon className="h-6 w-6 origin-left transform-gpu text-[var(--text-primary)] transition-all duration-300 ease-in-out group-hover:scale-95 group-hover:text-[var(--color-brand)]" />
          </div>
        )}
        <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight font-heading group-hover:text-[var(--color-brand)] transition-colors">
          {name}
        </h3>
        <p className="max-w-md text-xs text-[var(--text-secondary)] leading-relaxed font-sans">{description}</p>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute bottom-0 z-20 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
        )}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleAction}
          className="pointer-events-auto bg-[var(--surface-card)]/90 backdrop-blur-xs border border-[var(--border-card)] text-[var(--text-primary)] font-semibold hover:bg-[var(--surface-subtle)] hover:text-[var(--color-brand)] hover:border-[var(--color-brand)]/40 shadow-xs"
        >
          <span>{cta}</span>
          <ArrowRightIcon className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-[var(--color-brand)]/[.03]" />
    </div>
  );
};

export { BentoCard, BentoGrid };
