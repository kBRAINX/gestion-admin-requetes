'use client';

import { useTheme } from '@/contexts/ThemeContext';
import Pagination from './Pagination';

export default function Table({
  columns,
  data,
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) {
  const { colors } = useTheme();

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y ${className}`} style={{ borderColor: colors.border }}>
        <thead>
          <tr style={{ backgroundColor: colors.background.secondary }}>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: colors.text.tertiary }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y" style={{ backgroundColor: colors.background.primary, borderColor: colors.border }}>
          {data.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-opacity-50"
              style={{
                backgroundColor: rowIndex % 2 === 0 ? 'transparent' : colors.background.secondary,
              }}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}