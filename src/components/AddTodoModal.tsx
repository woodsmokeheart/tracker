import React, { useState } from 'react';
import styles from './AddTodoModal.module.css';

interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, description: string) => void;
}

const AddTodoModal: React.FC<AddTodoModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title, description.trim());
      setTitle('');
      setDescription('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className={styles.modalContent}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            required
          />
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description (optional)"
          />
          <button type="submit" className={styles.submitButton}>
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTodoModal; 