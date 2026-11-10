import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
export const Modal = ({ isOpen, onClose, title, description, children, size = 'md', showCloseButton = true, closeOnOverlayClick = true, closeOnEscape = true, }) => {
    const handleEscape = useCallback((event) => {
        if (event.key === 'Escape' && closeOnEscape) {
            onClose();
        }
    }, [closeOnEscape, onClose]);
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleEscape]);
    if (!isOpen)
        return null;
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-4xl',
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", role: "dialog", "aria-modal": "true", "aria-labelledby": title ? 'modal-title' : undefined, children: _jsxs("div", { className: "flex min-h-full items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 transition-opacity", "aria-hidden": "true", onClick: closeOnOverlayClick ? onClose : undefined }), _jsxs("div", { className: `
            relative w-full ${sizeClasses[size]} bg-white rounded-xl shadow-xl
            transform transition-all animate-in fade-in zoom-in-95
          `, children: [(title || showCloseButton) && (_jsxs("div", { className: "flex items-start justify-between p-6 border-b border-gray-100", children: [_jsxs("div", { children: [title && (_jsx("h2", { id: "modal-title", className: "text-lg font-semibold text-gray-900", children: title })), description && (_jsx("p", { className: "mt-1 text-sm text-gray-500", children: description }))] }), showCloseButton && (_jsx("button", { onClick: onClose, className: "p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors", "aria-label": "Close modal", children: _jsx(X, { className: "w-5 h-5" }) }))] })), _jsx("div", { className: "p-6", children: children })] })] }) }));
};
export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'primary', isLoading, }) => {
    return (_jsxs(Modal, { isOpen: isOpen, onClose: onClose, title: title, size: "sm", children: [_jsx("p", { className: "text-gray-600 mb-6", children: message }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(Button, { variant: "ghost", onClick: onClose, disabled: isLoading, children: cancelText }), _jsx(Button, { variant: variant === 'danger' ? 'danger' : 'primary', onClick: onConfirm, isLoading: isLoading, children: confirmText })] })] }));
};
