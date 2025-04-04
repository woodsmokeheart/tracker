import React, { useState } from 'react';
import { FaEdit, FaTrash, FaCheck, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from './TodoItem.module.css';

interface TodoItemProps {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, description: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  id,
  title,
  description,
  completed,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onEdit(id, editTitle, editDescription);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className={styles.itemContainer}>
        <form className={styles.editForm} onSubmit={handleSubmit}>
          <input
            type="text"
            className={styles.input}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title"
            required
          />
          <textarea
            className={styles.textarea}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Task description (optional)"
          />
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.button}>
              <FaCheck color="#4CAF50" />
            </button>
            <button type="button" className={styles.button} onClick={() => setIsEditing(false)}>
              <FaTrash color="#f44336" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  const shouldShowExpandButton = title.length > 50 || (description && description.length > 100);

  return (
    <div className={`${styles.itemContainer} ${isExpanded ? styles.expanded : ''}`}>
      <h3 className={`${styles.title} ${completed ? styles.titleCompleted : ''}`}>
        {title}
      </h3>
      {description && (
        <p className={`${styles.description} ${completed ? styles.descriptionCompleted : ''}`}>
          {description}
        </p>
      )}
      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={() => onToggle(id)}>
          <FaCheck color={completed ? "#4CAF50" : "#888"} />
        </button>
        <button className={styles.button} onClick={() => setIsEditing(true)}>
          <FaEdit color="#2196F3" />
        </button>
        <button className={styles.button} onClick={() => onDelete(id)}>
          <FaTrash color="#f44336" />
        </button>
        {shouldShowExpandButton && (
          <button 
            className={styles.expandButton} 
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        )}
      </div>
    </div>
  );
};

export default TodoItem; 