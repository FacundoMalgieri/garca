"use client";

import Link from "next/link";
import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useInvoiceContext } from "@/contexts/InvoiceContext";
import { useTheme } from "@/hooks/useTheme";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { state, clearInvoices } = useInvoiceContext();
  const { theme, toggleTheme, mounted } = useTheme();

  const invoices = state.invoices;

  const handleClearData = () => {
    clearInvoices();
    setIsOpen(false);
  };

  const scrollToSection = (id: string) => {
    // Cerrar menú mobile primero
    setIsOpen(false);

    // Esperar a que el menú se cierre antes de hacer scroll
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const offset = 80; // Altura del navbar + margen
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    // Si hay datos, hacer scroll al top en lugar de navegar
    if (invoices.length > 0) {
      e.preventDefault();
      scrollToTop();
    }
    // Si no hay datos, dejar que navegue normalmente a "/"
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-slate-200 dark:border-border shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] dark:shadow-none">
      <div className="w-full max-w-[1920px] mx-auto px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity"
          >
            <img src="/logo-icon.svg" alt="GARCA Logo" className="h-10 w-10" />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-primary dark:text-white">GARCA</span>
              <span className="hidden lg:block text-xs text-muted-foreground">
                Gestor de Recuperación de Comprobantes de ARCA
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {invoices.length > 0 && (
            <div className="hidden lg:flex items-center gap-4 xl:gap-6">
              <NavButton onClick={() => scrollToSection("monotributo")} icon={<ClipboardIcon />}>
                Monotributo
              </NavButton>
              <NavButton onClick={() => scrollToSection("graficos")} icon={<ChartIcon />}>
                Gráficos
              </NavButton>
              <NavButton onClick={() => scrollToSection("totales")} icon={<ChartIcon />}>
                Totales
              </NavButton>
              <NavButton onClick={() => scrollToSection("facturas")} icon={<InvoiceIcon />}>
                Facturas
              </NavButton>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary dark:border-border bg-muted transition-colors hover:bg-muted/80 cursor-pointer"
                title={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
              >
                {theme === "light" ? <MoonIcon /> : <SunIcon />}
              </button>
            )}

            {/* Clear Data Button */}
            {invoices.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-destructive border border-destructive transition-colors hover:bg-destructive/10 sm:inline-flex items-center gap-2 cursor-pointer"
                title="Limpiar todos los datos almacenados"
              >
                <TrashIcon />
                Limpiar Datos
              </button>
            )}

            {/* Ingresar Button - cuando no hay datos */}
            {invoices.length === 0 && (
              <Link
                href="/ingresar"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Ingresar
              </Link>
            )}

            {/* Hamburger Menu (Mobile) */}
            {invoices.length > 0 && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden cursor-pointer"
                aria-label="Abrir menú"
              >
                {isOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && invoices.length > 0 && (
          <div className="border-t border-border bg-background py-4 lg:hidden">
            <div className="flex flex-col gap-3">
              <MobileNavButton onClick={() => scrollToSection("monotributo")} icon={<ClipboardIcon />}>
                Monotributo
              </MobileNavButton>
              <MobileNavButton onClick={() => scrollToSection("graficos")} icon={<ChartIcon />}>
                Gráficos
              </MobileNavButton>
              <MobileNavButton onClick={() => scrollToSection("totales")} icon={<ChartIcon />}>
                Totales
              </MobileNavButton>
              <MobileNavButton onClick={() => scrollToSection("facturas")} icon={<InvoiceIcon />}>
                Facturas
              </MobileNavButton>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-3 rounded-lg px-4 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
              >
                <TrashIcon />
                Limpiar Datos
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clear Data Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearData}
        title="¿Limpiar todos los datos?"
        description="Esta acción eliminará todas las facturas y datos almacenados en tu navegador. No se puede deshacer."
        confirmText="Sí, limpiar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </nav>
  );
}

// Sub-components

interface NavButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function NavButton({ onClick, icon, children }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm font-medium text-primary dark:text-white transition-colors hover:opacity-80 cursor-pointer whitespace-nowrap"
    >
      {icon}
      {children}
    </button>
  );
}

function MobileNavButton({ onClick, icon, children }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-4 py-2 text-left text-sm font-medium text-primary dark:text-white transition-colors hover:bg-muted cursor-pointer"
    >
      {icon}
      {children}
    </button>
  );
}

// Icons

function InvoiceIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="h-5 w-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

