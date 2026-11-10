import React, { useState, useRef, useEffect, useCallback, MutableRefObject } from 'react';
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
  disabled?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  onSelect,
  alignment = 'right',
  className = '',
  disabled = false,
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

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

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
        onClick={handleTriggerClick}
        disabled={disabled}
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
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<any>) => void;
  onBlur?: (event: React.FocusEvent<any>) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  label?: string;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(({
  value = '',
  onChange,
  options,
  placeholder,
  className = '',
  disabled,
  error,
  label,
  onBlur,
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null) as MutableRefObject<HTMLDivElement | null>;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (newValue: string) => {
    if (onChange) {
      // Create a synthetic event for react-hook-form compatibility
      const syntheticEvent = {
        target: { value: newValue },
        type: 'change',
        currentTarget: { value: newValue },
        nativeEvent: null,
        bubbles: false,
        cancelable: false,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: false,
        preventDefault: () => {},
        stopPropagation: () => {},
        stopImmediatePropagation: () => {},
        timeStamp: Date.now(),
        persist: () => {},
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
      } as unknown as React.ChangeEvent<any>;
      onChange(syntheticEvent);
    }
  };

  const handleBlur = () => {
    if (onBlur) {
      // Create a synthetic focus event for react-hook-form compatibility
      const syntheticEvent = {
        target: { value },
        type: 'blur',
        currentTarget: { value },
        nativeEvent: null,
        bubbles: false,
        cancelable: false,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: false,
        preventDefault: () => {},
        stopPropagation: () => {},
        stopImmediatePropagation: () => {},
        timeStamp: Date.now(),
        persist: () => {},
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        relatedTarget: null,
      } as unknown as React.FocusEvent<any>;
      onBlur(syntheticEvent);
    }
  };

  const setRef = (el: HTMLDivElement | null) => {
    selectRef.current = el;
    if (typeof ref === 'function') {
      ref(el);
    } else if (ref && typeof ref === 'object' && 'current' in ref) {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
    }
  };

  return (
    <div ref={setRef} className={`relative ${className}`} onBlur={handleBlur}>
      {label && (
        <label className="label">{label}</label>
      )}
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
                    handleChange(option.value);
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
});

Select.displayName = 'Select';