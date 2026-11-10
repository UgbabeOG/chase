import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export function Table({ columns, data, keyExtractor, isLoading, emptyMessage = 'No data available', className = '', striped = true, hoverable = true, onRowClick, }) {
    if (isLoading) {
        return (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsx("tr", { children: columns.map((column) => (_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: column.header }, column.key))) }) }), _jsx("tbody", { children: [...Array(5)].map((_, i) => (_jsx("tr", { children: columns.map((column) => (_jsx("td", { className: "px-4 py-3", children: _jsx("div", { className: "h-4 bg-gray-200 rounded animate-pulse w-3/4" }) }, column.key))) }, i))) })] }) }));
    }
    if (data.length === 0) {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: emptyMessage })] }));
    }
    return (_jsx("div", { className: `overflow-x-auto ${className}`, children: _jsxs("table", { className: "w-full", role: "table", children: [_jsx("thead", { className: "bg-gray-50", children: _jsx("tr", { children: columns.map((column) => (_jsx("th", { scope: "col", className: `
                  px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${column.headerClassName || ''}
                `, children: column.header }, column.key))) }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: data.map((row, rowIndex) => (_jsx("tr", { className: `
                ${striped && rowIndex % 2 === 1 ? 'bg-gray-50' : ''}
                ${hoverable ? 'hover:bg-gray-50' : ''}
                ${onRowClick ? 'cursor-pointer' : ''}
                transition-colors
              `, onClick: () => onRowClick?.(row), children: columns.map((column) => (_jsx("td", { className: `
                    px-4 py-3 text-sm text-gray-900
                    ${column.className || ''}
                  `, children: column.render ? column.render(row, rowIndex) : String(row[column.key] ?? '') }, column.key))) }, keyExtractor(row)))) })] }) }));
}
export const Pagination = ({ currentPage, totalPages, onPageChange, className = '', }) => {
    if (totalPages <= 1)
        return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const visiblePages = pages.filter((page) => page === 1 ||
        page === totalPages ||
        (page >= currentPage - 1 && page <= currentPage + 1));
    return (_jsxs("nav", { className: `flex items-center justify-between px-4 py-3 border-t border-gray-200 ${className}`, "aria-label": "Pagination", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => onPageChange(currentPage - 1), disabled: currentPage === 1, className: "p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors", "aria-label": "Previous page", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsx("div", { className: "flex items-center gap-1", children: visiblePages.map((page, index) => {
                            const prevPage = visiblePages[index - 1];
                            const showEllipsis = prevPage && page - prevPage > 1;
                            return (_jsxs(React.Fragment, { children: [showEllipsis && (_jsx("span", { className: "px-2 text-gray-400", children: "..." })), _jsx("button", { onClick: () => onPageChange(page), className: `
                    w-8 h-8 rounded-lg text-sm font-medium transition-colors
                    ${page === currentPage
                                            ? 'bg-chase-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'}
                  `, "aria-label": `Page ${page}`, "aria-current": page === currentPage ? 'page' : undefined, children: page })] }, page));
                        }) }), _jsx("button", { onClick: () => onPageChange(currentPage + 1), disabled: currentPage === totalPages, className: "p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors", "aria-label": "Next page", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) })] }), _jsxs("div", { className: "text-sm text-gray-500", children: ["Page ", currentPage, " of ", totalPages] })] }));
};
