'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, checked, defaultChecked, onChange, disabled, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(defaultChecked || false);
    const controlled = checked !== undefined;
    const currentChecked = controlled ? checked : isChecked;

    const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!controlled) {
        setIsChecked(e.target.checked);
      }
      onChange?.(e);
    };

    return (
      <div className="flex flex-col space-y-1">
        <label
          htmlFor={inputId}
          className={cn(
            'inline-flex items-center gap-2.5 cursor-pointer select-none text-sm text-slate-700 font-medium',
            disabled && 'opacity-60 cursor-not-allowed',
            className,
          )}
        >
          <div className="relative flex items-center justify-center">
            <input
              id={inputId}
              ref={ref}
              type="checkbox"
              checked={currentChecked}
              onChange={handleChange}
              disabled={disabled}
              className="peer sr-only"
              {...props}
            />
            <div
              className={cn(
                'w-5 h-5 rounded-lg border-2 border-slate-300 bg-white transition-all duration-150 flex items-center justify-center',
                'peer-focus-visible:ring-4 peer-focus-visible:ring-amber-400/20 peer-focus-visible:border-amber-400',
                'peer-checked:bg-amber-400 peer-checked:border-amber-400 text-gray-950 shadow-xs',
                error && 'border-red-400',
              )}
            >
              <Check
                className={cn(
                  'w-3.5 h-3.5 stroke-[3] transition-transform duration-150 transform scale-0',
                  currentChecked && 'scale-100',
                )}
              />
            </div>
          </div>
          {label && <span className="text-sm font-medium">{label}</span>}
        </label>
        {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
