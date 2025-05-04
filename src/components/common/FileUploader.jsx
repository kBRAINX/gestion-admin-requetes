'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function FileUploader({
  onChange,
  multiple = true,
  accept,
  className = '',
}) {
  const { colors, isDarkMode } = useTheme();

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onChange({ target: { files } });
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-opacity-70 ${className}`}
      style={{ borderColor: colors.border }}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        multiple={multiple}
        accept={accept}
        onChange={onChange}
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer"
      >
        <div>
          <svg
            className="mx-auto h-12 w-12 mb-4"
            style={{ color: colors.text.tertiary }}
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-sm" style={{ color: colors.text.primary }}>
            <span className="font-medium" style={{ color: colors.primary }}>
              Cliquez pour télécharger
            </span>{' '}
            ou glissez et déposez
          </div>
          <p className="text-xs mt-1" style={{ color: colors.text.tertiary }}>
            {multiple ? 'Plusieurs fichiers autorisés' : 'Un seul fichier'}
          </p>
        </div>
      </label>
    </div>
  );
}