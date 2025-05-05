import React, { useEffect, useState, useRef } from 'react';
import styles from './UndoToast.module.css';

interface UndoToastProps {
  onUndo: () => void;
  onComplete: () => void;
  duration: number;
}

const UndoToast: React.FC<UndoToastProps> = ({ onUndo, onComplete, duration }) => {
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(duration / 1000));
  const endTimeRef = useRef<number>(Date.now() + duration);
  const frameRef = useRef<number | undefined>(undefined);
  const isRunningRef = useRef<boolean>(true);

  useEffect(() => {
    const updateTimer = () => {
      if (!isRunningRef.current) return;

      const now = Date.now();
      const remaining = Math.max(0, endTimeRef.current - now);
      const seconds = Math.ceil(remaining / 1000);
      
      if (seconds <= 0) {
        isRunningRef.current = false;
        onComplete();
      } else {
        setSecondsLeft(seconds);
        frameRef.current = requestAnimationFrame(updateTimer);
      }
    };

    frameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [onComplete]);

  const handleUndo = () => {
    isRunningRef.current = false;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    onUndo();
  };

  return (
    <div className={styles.toast}>
      <div className={styles.content}>
        <span>Task deleted ({secondsLeft}s)</span>
        <button onClick={handleUndo} className={styles.undoButton}>
          Undo
        </button>
      </div>
    </div>
  );
};

export default UndoToast; 