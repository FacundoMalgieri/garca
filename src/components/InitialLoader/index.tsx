"use client";

import { useEffect, useState } from "react";

// Color celeste del logo
const LOGO_CYAN = "#64D3DE";

interface InitialLoaderProps {
  children: React.ReactNode;
}

export function InitialLoader({ children }: InitialLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="w-full max-w-md px-6 text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative">
              <img src="/logo-icon.svg" alt="GARCA Logo" className="h-24 w-24 animate-pulse" />
              <div className="absolute inset-0 -m-3">
                <div 
                  className="h-[120px] w-[120px] rounded-full border-4 animate-spin"
                  style={{
                    borderColor: `${LOGO_CYAN}33`, // 20% opacity
                    borderTopColor: LOGO_CYAN,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-primary dark:text-white">GARCA</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Gestor Automático de Recuperación de Comprobantes de ARCA
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

