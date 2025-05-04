'use client';

import { useTheme } from '@/contexts/ThemeContext';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation',
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  confirmVariant = 'primary',
  icon,
}) {
  const { colors, isDarkMode } = useTheme();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
    >
      <div className="p-6">
        {icon && (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            {icon}
          </div>
        )}

        <div className="text-center sm:text-left">
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            {message}
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
          <Button
            onClick={handleConfirm}
            variant={confirmVariant}
            className="w-full sm:w-auto sm:ml-3"
          >
            {confirmLabel}
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full sm:w-auto"
            style={{ borderColor: colors.border }}
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}