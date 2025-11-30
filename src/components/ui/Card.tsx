import { cn } from "@/lib/utils";

/**
 * Card component for consistent styling across the application.
 * Uses shadow in light mode and subtle border in dark mode.
 */
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-none md:rounded-lg bg-white dark:bg-background px-4 pt-3 pb-4 md:p-6",
        "shadow-none md:shadow-md dark:shadow-none",
        "border-0 md:border md:border-border",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Card header section for titles and descriptions.
 */
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

/**
 * Card title component.
 */
interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn("text-lg font-semibold", className)}>{children}</h3>
  );
}

/**
 * Card description component.
 */
interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}

/**
 * Card content section.
 */
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn(className)}>{children}</div>;
}
