import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import styles from './ProductivityModal.module.css';

interface ProductivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Array<{
    date: string;
    completed: number;
  }>;
}

const ProductivityModal: React.FC<ProductivityModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  if (!isOpen) return null;

  const processData = () => {
    if (!data) return [];
    
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      tasks: item.completed
    }));
  };

  const chartData = processData();

  return (
    <div className={styles.modalOverlay} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Productivity Stats</h2>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart 
              data={chartData} 
              margin={{ 
                top: 20, 
                right: 15, 
                left: 0, 
                bottom: 20 
              }}
            >
              <defs>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false}
                stroke="var(--border-color)"
                strokeOpacity={0.5}
              />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-color)"
                tick={{ fill: 'var(--text-color)' }}
                axisLine={{ stroke: 'var(--border-color)' }}
                tickMargin={10}
                dy={10}
              />
              <YAxis 
                stroke="var(--text-color)"
                tick={{ fill: 'var(--text-color)' }}
                axisLine={{ stroke: 'var(--border-color)' }}
                tickCount={5}
                allowDecimals={false}
                tickMargin={5}
                width={30}
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--nav-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-color)'
                }}
                labelStyle={{ color: 'var(--text-color)' }}
              />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="var(--primary-color)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: 'var(--primary-color)' }}
                fill="url(#colorTasks)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProductivityModal; 