interface CurrencyBadgeProps {
  currency: string;
  variant?: "default" | "light";
  label: string;
}

export function CurrencyBadge({ currency, variant = "default", label }: CurrencyBadgeProps) {
  const baseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-transform hover:scale-105 cursor-default";
  
  const variantClasses = variant === "light" 
    ? "bg-white/10 border-white/30 text-white"
    : "bg-card border-border text-foreground";

  return (
    <div className={`${baseClasses} ${variantClasses}`}>
      <span className="font-bold">{currency}</span>
      <span className="text-xs opacity-70">{label}</span>
    </div>
  );
}
