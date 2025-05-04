'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const { colors } = useTheme();

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const pageButtonStyle = (isActive) => ({
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    backgroundColor: isActive ? colors.primary : 'transparent',
    color: isActive ? '#FFFFFF' : colors.text.primary,
    cursor: 'pointer',
    border: '1px solid',
    borderColor: isActive ? colors.primary : colors.border,
  });

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="disabled:opacity-50"
          style={pageButtonStyle(false)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={index}
                className="px-3 py-2"
                style={{ color: colors.text.tertiary }}
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              style={pageButtonStyle(currentPage === page)}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="disabled:opacity-50"
          style={pageButtonStyle(false)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div style={{ color: colors.text.secondary }}>
        <span className="text-sm">
          Page {currentPage} sur {totalPages}
        </span>
      </div>
    </div>
  );
}