import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from './Button';

interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  onSelect: (value: string, item: DropdownItem) => void;
  alignment?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  onSelect,
  alignment = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      onSelect(item.value, item);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        rightIcon={<ChevronDown className="w-4 h-4" />}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </Button>

      {isOpen && (
        <div
          className={`
            fixed z-50 mt-1 min-w-[180px] bg-white rounded-lg border border-gray-200 shadow-lg
            ${alignment === 'right' ? 'right-0' : 'left-0'}
            animate-in fade-in-0 zoom-in-95
          `}
          role="menu"
          onKeyDown={handleKeyDown}
        >
          <ul className="py-1" role="listbox">
            {items.map((item, index) => (
              <li key={item.value}>
                <button
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={`
                    w-full px-4 py-2 text-sm flex items-center gap-2
                    ${item.danger ? 'text-red-600' : 'text-gray-700'}
                    ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                    transition-colors
                  `}
                  role="option"
                  aria-selected={false}
                  aria-disabled={item.disabled}
                >
                  {item.icon && <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>}
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  className = '',
  disabled,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-2.5 text-sm border rounded-lg bg-white
          flex items-center justify-between
          focus:outline-none focus:ring-2 focus:ring-chase-500 focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value ? options.find((o) => o.value === value)?.label : placeholder}
        </span>
        <svg
          className={`
            w-4 h-4 text-gray-400 transition-transform
            ${isOpen ? 'rotate-180' : ''}
          `}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg animate-in fade-in-0 zoom-in-95">
          <ul className="py-1 max-h-60 overflow-auto" role="listbox">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-2 text-sm flex items-center gap-2
                    ${value === option.value ? 'bg-chase-50 text-chase-700' : 'text-gray-700 hover:bg-gray-50'}
                    transition-colors
                  `}
                  role="option"
                  aria-selected={value === option.value}
                >
                  {value === option.value && <Check className="w-4 h-4 text-chase-600 flex-shrink-0" />}
                  <span className="flex-1 text-left">{option.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};