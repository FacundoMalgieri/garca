"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  align?: "left" | "right" | "auto";
}

/**
 * Calculates optimal alignment to prevent overflow.
 */
function calculateAlignment(
  buttonRef: HTMLDivElement | null,
  preferredAlign: "left" | "right" | "auto"
): "left" | "right" {
  if (preferredAlign !== "auto" || !buttonRef) {
    return preferredAlign === "auto" ? "left" : preferredAlign;
  }

  const rect = buttonRef.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const menuMinWidth = 160; // min-w-[160px]

  // Check if menu would overflow on the right when aligned left
  const wouldOverflowRight = rect.left + menuMinWidth > viewportWidth;

  // Check if menu would overflow on the left when aligned right
  const wouldOverflowLeft = rect.right - menuMinWidth < 0;

  // Prefer right alignment if it would overflow on the right
  if (wouldOverflowRight && !wouldOverflowLeft) {
    return "right";
  }

  return "left";
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  className,
  buttonClassName,
  menuClassName,
  align = "auto",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [computedAlign, setComputedAlign] = useState<"left" | "right">("left");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate alignment when opening
  const handleToggle = () => {
    if (!isOpen) {
      setComputedAlign(calculateAlignment(dropdownRef.current, align));
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "flex items-center justify-between gap-2 w-full px-3 py-2 text-sm rounded-lg border border-border bg-white dark:bg-background text-foreground cursor-pointer transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary",
          buttonClassName
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon}
              {selectedOption.label}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <svg
          className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full min-w-[160px] bg-white dark:bg-background border border-border rounded-lg shadow-lg overflow-hidden",
            computedAlign === "right" ? "right-0" : "left-0",
            menuClassName
          )}
        >
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left cursor-pointer transition-colors",
                  option.value === value
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Action dropdown for buttons like Export
interface ActionDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  menuClassName?: string;
  align?: "left" | "right" | "auto";
}

export function ActionDropdown({
  trigger,
  children,
  className,
  menuClassName,
  align = "auto",
}: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [computedAlign, setComputedAlign] = useState<"left" | "right">("left");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      setComputedAlign(calculateAlignment(dropdownRef.current, align));
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div onClick={handleToggle}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[160px] bg-white dark:bg-background border border-border rounded-lg shadow-lg overflow-hidden",
            computedAlign === "right" ? "right-0" : "left-0",
            menuClassName
          )}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface ActionDropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function ActionDropdownItem({ children, onClick, icon, className }: ActionDropdownItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted cursor-pointer transition-colors",
        className
      )}
    >
      {icon}
      {children}
    </button>
  );
}

