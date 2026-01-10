import React, { FC } from 'react';
import styles from './SliderToggle.module.scss';

interface SliderToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  id?: string;
}

const SliderToggle: FC<SliderToggleProps> = ({
  checked,
  onChange,
  className,
  id,
}) => {
  return (
    <button
      type="button"
      id={id}
      className={`${styles.toggle} ${checked ? styles.on : styles.off} ${className || ''}`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <div className={styles.slider} />
    </button>
  );
};

export default SliderToggle;
