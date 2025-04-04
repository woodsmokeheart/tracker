import React, { useState } from 'react';
import { FaTimes, FaChartLine, FaCalendarDay, FaCalendarWeek, FaCalendarAlt } from 'react-icons/fa';
import styles from './ProductivityModal.module.css';

interface ProductivityData {
  date: string;
  completed: number;
}

interface ProductivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ProductivityData[];
}

type TimeRange = 'day' | 'week' | 'month';

const ProductivityModal: React.FC<ProductivityModalProps> = ({ isOpen, onClose, data }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('day');

  if (!isOpen) return null;

  const getFilteredData = () => {
    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    return data.filter(item => new Date(item.date) >= startDate);
  };

  const getStats = () => {
    const filteredData = getFilteredData();
    const total = filteredData.reduce((sum, item) => sum + item.completed, 0);
    const average = filteredData.length ? (total / filteredData.length).toFixed(1) : '0';

    return {
      total,
      average,
    };
  };

  const stats = getStats();

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        <h2 className={styles.title}>Productivity Stats</h2>
        
        <div className={styles.timeRangeButtons}>
          <button
            className={`${styles.rangeButton} ${timeRange === 'day' ? styles.active : ''}`}
            onClick={() => setTimeRange('day')}
          >
            <FaCalendarDay /> Day
          </button>
          <button
            className={`${styles.rangeButton} ${timeRange === 'week' ? styles.active : ''}`}
            onClick={() => setTimeRange('week')}
          >
            <FaCalendarWeek /> Week
          </button>
          <button
            className={`${styles.rangeButton} ${timeRange === 'month' ? styles.active : ''}`}
            onClick={() => setTimeRange('month')}
          >
            <FaCalendarAlt /> Month
          </button>
        </div>

        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <h3>Completed Tasks</h3>
            <p className={styles.statNumber}>{stats.total}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Daily Average</h3>
            <p className={styles.statNumber}>{stats.average}</p>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <FaChartLine className={styles.chartPlaceholder} />
          <p className={styles.chartText}>
            You've completed {stats.total} tasks in this {timeRange}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductivityModal; 