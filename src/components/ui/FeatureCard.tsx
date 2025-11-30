interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

export function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
  return (
    <div className="group relative rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 h-full transition-all duration-500 hover:border-transparent hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none overflow-hidden">
      {/* Gradient border on hover */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="absolute inset-[1px] rounded-[23px] bg-white dark:bg-slate-900 transition-colors duration-500 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/80" />
      
      {/* Content */}
      <div className="relative">
        {/* Icon with gradient background */}
        <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        
        <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
