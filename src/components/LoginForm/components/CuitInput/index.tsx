"use client";

interface CuitInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CuitInput({ value, onChange, disabled }: CuitInputProps) {
  const handleChange = (e: React.ChangeEvent<globalThis.HTMLInputElement>) => {
    // Only allow digits, max 11 characters
    onChange(e.target.value.replace(/\D/g, "").slice(0, 11));
  };

  return (
    <div className="space-y-2">
      <label htmlFor="cuit" className="block text-sm font-medium">
        CUIT
      </label>
      <input
        id="cuit"
        type="text"
        placeholder="20123456789"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="block w-full rounded border border-border bg-background px-3 py-2 text-sm focus-ring disabled:opacity-50"
        maxLength={11}
        autoComplete="username"
      />
      <p className="text-xs text-muted-foreground">
        Ingresá tu CUIT sin guiones (11 dígitos)
      </p>
    </div>
  );
}

