import React from 'react';
import { FaTimes, FaCheck } from 'react-icons/fa';
import styles from './ViewTodoModal.module.css';

interface ViewTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  todo: {
    title: string;
    description: string;
    completed: boolean;
    imageUrl?: string;
  };
}

const ViewTodoModal: React.FC<ViewTodoModalProps> = ({ isOpen, onClose, todo }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.status}>
            <FaCheck color={todo.completed ? "#4CAF50" : "#888"} />
            <span>{todo.completed ? 'Completed' : 'Active'}</span>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.modalBody}>
          <h2 className={styles.title}>{todo.title}</h2>
          
          {todo.imageUrl && (
            <div className={styles.imageContainer}>
              <img 
                src={todo.imageUrl} 
                alt="Task" 
                className={styles.image}
                onError={(e) => {
                  console.error('Failed to load image:', todo.imageUrl);
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = 'none';
                }}
              />
            </div>
          )}
          
          {todo.description && (
            <p className={styles.description}>{todo.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewTodoModal; 