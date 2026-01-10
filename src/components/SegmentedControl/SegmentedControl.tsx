import React from "react";
import { toast } from "sonner";
import styles from "./SegmentedControl.module.scss";

export type SegmentOption = {
  name: string;
  value: string;
  disabled?: boolean;
  disabledToast?: string;
};

type SegmentedControlProps = {
  options: SegmentOption[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
};

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className = "",
}) => {
  const handleClick = (opt: SegmentOption) => {
    if (opt.disabled) {
      if (opt.disabledToast) {
        toast.info(opt.disabledToast, {
          position: "top-center",
        });
      }
      return;
    }

    onChange(opt.value);
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {options.map((opt) => {
        const isActive = opt.value === value;

        return (
          <button
            key={opt.value}
            className={`${styles.option} ${isActive ? styles.active : ""}`}
            onClick={() => handleClick(opt)}
            disabled={opt.disabled}
            style={
              opt.disabled ? { opacity: 0.4, cursor: "not-allowed" } : undefined
            }
          >
            {opt.name}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
