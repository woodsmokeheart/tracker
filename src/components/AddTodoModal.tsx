import React, { useState } from 'react';
import { FaTimes, FaImage, FaTrash } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import styles from './AddTodoModal.module.css';

interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, description: string, imageUrl?: string) => void;
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_DIMENSIONS = { width: 1200, height: 1200 };

const AddTodoModal: React.FC<AddTodoModalProps> = ({ isOpen, onClose, onAdd }) => {
  const { session } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    // Create image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        if (img.width > MAX_IMAGE_DIMENSIONS.width || img.height > MAX_IMAGE_DIMENSIONS.height) {
          toast.error(`Image dimensions should not exceed ${MAX_IMAGE_DIMENSIONS.width}x${MAX_IMAGE_DIMENSIONS.height}px`);
          return;
        }
        setImagePreview(reader.result as string);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    setImage(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let imageUrl: string | undefined;

    if (image && session) {
      setIsUploading(true);
      try {
        const fileExt = image.name.split('.').pop();
        const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('todo-images')
          .upload(fileName, image);

        if (error) throw error;

        // Get the public URL using the correct method
        const { data: { publicUrl } } = supabase.storage
          .from('todo-images')
          .getPublicUrl(fileName);

        console.log('Generated public URL:', publicUrl);
        
        // Store the complete URL
        imageUrl = publicUrl;
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload image');
        setIsUploading(false);
        return;
      }
    }

    onAdd(title, description, imageUrl);
    setTitle('');
    setDescription('');
    setImage(null);
    setImagePreview(null);
    setIsUploading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        <h2 className={styles.title}>Add New Task</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="title" className={styles.label}>Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              placeholder="Enter task title"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="description" className={styles.label}>Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              placeholder="Enter task description"
              rows={4}
            />
          </div>
          <div className={styles.imageUpload}>
            <label className={styles.imageLabel}>
              <FaImage />
              <span>Add Image (max 2MB, 1200x1200px)</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className={styles.imageInput}
              />
            </label>
            {imagePreview && (
              <div className={styles.imagePreview}>
                <img src={imagePreview} alt="Preview" />
                <button type="button" onClick={removeImage} className={styles.removeImage}>
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Add Task'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTodoModal; 