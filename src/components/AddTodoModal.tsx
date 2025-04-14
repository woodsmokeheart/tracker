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

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_DIMENSIONS = { width: 3000, height: 3000 };
const COMPRESSION_QUALITY = 0.7; // Качество сжатия (0.1 - 1.0)

const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Масштабируем изображение, если оно больше максимальных размеров
        if (width > MAX_IMAGE_DIMENSIONS.width) {
          height = (MAX_IMAGE_DIMENSIONS.width * height) / width;
          width = MAX_IMAGE_DIMENSIONS.width;
        }
        if (height > MAX_IMAGE_DIMENSIONS.height) {
          width = (MAX_IMAGE_DIMENSIONS.height * width) / height;
          height = MAX_IMAGE_DIMENSIONS.height;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Конвертируем в нужный формат с заданным качеством
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          file.type,
          COMPRESSION_QUALITY
        );
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

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
      toast.error('Image size should be less than 10MB');
      return;
    }

    try {
      // Сжимаем изображение перед предпросмотром
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], file.name, { type: file.type });
      
      // Создаем URL для предпросмотра сжатого изображения
      const previewUrl = URL.createObjectURL(compressedFile);
      setImagePreview(previewUrl);
      setImage(compressedFile);
      
      // Очищаем URL после установки предпросмотра
      return () => URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error('Error compressing image:', error);
      toast.error('Failed to process image');
    }
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
        
        const { error } = await supabase.storage
          .from('todo-images')
          .upload(fileName, image);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('todo-images')
          .getPublicUrl(fileName);

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
              <span>Add Image (max 10MB, 3000x3000px)</span>
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