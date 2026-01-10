import React, { FC } from 'react';
import styles from './DiscountSlider.module.scss';

interface DiscountSliderProps {
  label?: string;
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  className?: string;
}

const DiscountSlider: FC<DiscountSliderProps> = ({
  label = 'Descuento aplicado',
  min,
  max,
  value,
  onChange,
  className,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  // Protect against NaN
  const safeValue = isNaN(value) ? min : value;
  const clampedValue = Math.min(Math.max(safeValue, min), max);
  const percent = max > min ? ((clampedValue - min) / (max - min)) * 100 : 0;

  return (
    <div className={`${styles.rangeBlock} ${className || ''}`}>
      <div className={styles.rangeHeader}>
        <span>{label}</span>
        <span className={styles.rangeValue}>{clampedValue}%</span>
      </div>

      <div className={styles.trackWrapper}>
        <div className={styles.trackBackground} />
        <div className={styles.trackActive} style={{ width: `${percent}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={clampedValue}
          onChange={handleChange}
          className={styles.rangeInput}
        />
      </div>

      <div className={styles.rangeLimits}>
        <span>{min}%</span>
        <span>{max}%</span>
      </div>
    </div>
  );
};

export default DiscountSlider;
