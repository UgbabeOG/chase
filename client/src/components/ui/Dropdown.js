import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from './Button';
export const Dropdown = ({ trigger, items, onSelect, alignment = 'right', className = '', }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const handleClickOutside = useCallback((event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    }, []);
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);
    const handleItemClick = (item) => {
        if (!item.disabled) {
            onSelect(item.value, item);
            setIsOpen(false);
        }
    };
    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            setIsOpen(false);
        }
    };
    return (_jsxs("div", { ref: dropdownRef, className: `relative inline-block ${className}`, children: [_jsx(Button, { variant: "ghost", size: "sm", rightIcon: _jsx(ChevronDown, { className: "w-4 h-4" }), onClick: () => setIsOpen(!isOpen), "aria-haspopup": "true", "aria-expanded": isOpen, children: trigger }), isOpen && (_jsx("div", { className: `
            fixed z-50 mt-1 min-w-[180px] bg-white rounded-lg border border-gray-200 shadow-lg
            ${alignment === 'right' ? 'right-0' : 'left-0'}
            animate-in fade-in-0 zoom-in-95
          `, role: "menu", onKeyDown: handleKeyDown, children: _jsx("ul", { className: "py-1", role: "listbox", children: items.map((item, index) => (_jsx("li", { children: _jsxs("button", { onClick: () => handleItemClick(item), disabled: item.disabled, className: `
                    w-full px-4 py-2 text-sm flex items-center gap-2
                    ${item.danger ? 'text-red-600' : 'text-gray-700'}
                    ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                    transition-colors
                  `, role: "option", "aria-selected": false, "aria-disabled": item.disabled, children: [item.icon && _jsx("span", { className: "w-4 h-4 flex-shrink-0", children: item.icon }), _jsx("span", { className: "flex-1 text-left", children: item.label })] }) }, item.value))) }) }))] }));
};
export const Select = ({ value, onChange, options, placeholder, className = '', disabled, error, }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (_jsxs("div", { ref: selectRef, className: `relative ${className}`, children: [_jsxs("button", { type: "button", onClick: () => !disabled && setIsOpen(!isOpen), disabled: disabled, className: `
          w-full px-4 py-2.5 text-sm border rounded-lg bg-white
          flex items-center justify-between
          focus:outline-none focus:ring-2 focus:ring-chase-500 focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
        `, "aria-haspopup": "listbox", "aria-expanded": isOpen, children: [_jsx("span", { className: value ? 'text-gray-900' : 'text-gray-400', children: value ? options.find((o) => o.value === value)?.label : placeholder }), _jsx("svg", { className: `
            w-4 h-4 text-gray-400 transition-transform
            ${isOpen ? 'rotate-180' : ''}
          `, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })] }), isOpen && (_jsx("div", { className: "fixed z-50 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg animate-in fade-in-0 zoom-in-95", children: _jsx("ul", { className: "py-1 max-h-60 overflow-auto", role: "listbox", children: options.map((option) => (_jsx("li", { children: _jsxs("button", { onClick: () => {
                                onChange(option.value);
                                setIsOpen(false);
                            }, className: `
                    w-full px-4 py-2 text-sm flex items-center gap-2
                    ${value === option.value ? 'bg-chase-50 text-chase-700' : 'text-gray-700 hover:bg-gray-50'}
                    transition-colors
                  `, role: "option", "aria-selected": value === option.value, children: [value === option.value && _jsx(Check, { className: "w-4 h-4 text-chase-600 flex-shrink-0" }), _jsx("span", { className: "flex-1 text-left", children: option.label })] }) }, option.value))) }) }))] }));
};
