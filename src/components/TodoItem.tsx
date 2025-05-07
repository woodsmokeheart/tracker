import React, { useState } from 'react';
import { FaEdit, FaTrash, FaCheck } from 'react-icons/fa';
import ViewTodoModal from './ViewTodoModal';
import ImageLightbox from './ImageLightbox';
import styles from './TodoItem.module.css';

interface TodoItemProps {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  imageUrl?: string;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string, description: string, imageUrl?: string) => void;
  isDeleting: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({
  id,
  title,
  description,
  completed,
  imageUrl,
  onToggle,
  onDelete,
  onEdit,
  isDeleting,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description);
  const [editImageUrl, setEditImageUrl] = useState(imageUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onEdit(id, editTitle, editDescription, editImageUrl);
      setIsEditing(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(`.${styles.buttonContainer}`)) {
      return;
    }
    setIsViewModalOpen(true);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImageLightboxOpen(true);
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
          {editImageUrl && (
            <div className={styles.imageContainer}>
              <img 
                src={editImageUrl} 
                alt="Task" 
                className={styles.image}
                onClick={handleImageClick}
                onError={(e) => {
                  console.error('Failed to load edit image:', editImageUrl);
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = 'none';
                }}
              />
              <button
                type="button"
                className={styles.removeImage}
                onClick={() => setEditImageUrl(undefined)}
              >
                <FaTrash />
              </button>
            </div>
          )}
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.button}>
              <FaCheck color="#4CAF50" />
            </button>
            <button 
              type="button" 
              className={`${styles.button} ${styles.deleteButton}`}
              onClick={() => {
                setIsEditing(false);
                onDelete(id);
              }}
              disabled={isDeleting}
            >
              <FaTrash color="#f44336" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      <div 
        className={styles.itemContainer}
        onClick={handleCardClick}
      >
        <div className={styles.content}>
          <div className={styles.mainContent}>
            <div className={styles.textContent}>
              <h3 className={`${styles.title} ${completed ? styles.titleCompleted : ''}`}>
                {title}
              </h3>
              {description && (
                <p className={styles.description}>{description}</p>
              )}
            </div>

            {imageUrl && (
              <div className={styles.imageContainer}>
                <img 
                  src={imageUrl} 
                  alt="Task" 
                  className={styles.image}
                  onClick={handleImageClick}
                  onError={(e) => {
                    console.error('Failed to load image:', imageUrl);
                    const img = e.currentTarget as HTMLImageElement;
                    img.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className={styles.buttonContainer}>
            <button className={styles.button} onClick={() => onToggle(id, !completed)}>
              <FaCheck color={completed ? "#4CAF50" : "#888"} />
            </button>
            <button className={styles.button} onClick={() => setIsEditing(true)}>
              <FaEdit color="#2196F3" />
            </button>
            <button 
              className={`${styles.button} ${styles.deleteButton}`}
              onClick={() => onDelete(id)}
              disabled={isDeleting}
            >
              <FaTrash color="#f44336" />
            </button>
          </div>
        </div>
      </div>

      <ViewTodoModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        todo={{
          title,
          description,
          completed,
          imageUrl
        }}
      />

      {imageUrl && (
        <ImageLightbox
          isOpen={isImageLightboxOpen}
          onClose={() => setIsImageLightboxOpen(false)}
          imageUrl={imageUrl}
        />
      )}
    </>
  );
};

export default TodoItem; 