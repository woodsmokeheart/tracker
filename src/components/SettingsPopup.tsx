import React from 'react';
import { FaTrash } from 'react-icons/fa';
import styles from './SettingsPopup.module.css';

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onClearData: () => void;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.confirmOverlay}>
      <div className={styles.confirmContent}>
        <h3 className={styles.confirmTitle}>
          <FaTrash /> Clear All Data
        </h3>
        <p className={styles.confirmText}>
          Are you sure you want to clear all data? This action cannot be undone.
        </p>
        <div className={styles.confirmButtons}>
          <button className={`${styles.confirmButton} ${styles.cancelButton}`} onClick={onClose}>
            Cancel
          </button>
          <button className={`${styles.confirmButton} ${styles.deleteButton}`} onClick={onConfirm}>
            Clear Data
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsPopup: React.FC<SettingsPopupProps> = ({ isOpen, onClose, onClearData }) => {
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleClearClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    onClearData();
    setShowConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.popupOverlay} onClick={onClose}>
        <div className={styles.popupContent} onClick={e => e.stopPropagation()}>
          <button className={styles.clearButton} onClick={handleClearClick}>
            <FaTrash /> Clear All Data
          </button>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default SettingsPopup; 