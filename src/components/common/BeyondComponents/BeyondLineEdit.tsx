"use client";

import { useEffect, useState } from "react";

export default function BeyondLineEdit({
  value,
  onChange,
  placeholder,
  debounceDuration,
  className,
  id,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void | Promise<void>;
  placeholder?: string;
  debounceDuration?: number;
  className?: string;
  id?: string;
  disabled?: boolean;
}) {
  const [propValue, setPropValue] = useState(value);
  const [currentValue, setCurrentValue] = useState<string>(value);

  useEffect(() => {
    if (value !== propValue) {
      setPropValue(value);
      setCurrentValue(value);
    }
    const handler = setTimeout(() => {
      if (!disabled) {
        onChange(currentValue);
      }
    }, debounceDuration || 800);
    return () => {
      clearTimeout(handler);
    };
  }, [currentValue, value, propValue, debounceDuration, disabled]);

  return (
    <input
      type="text"
      value={currentValue}
      onChange={(e) => setCurrentValue(e.target.value)}
      placeholder={placeholder}
      className={`w-fit bg-bg-base-200 border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-primary text-sm  text-black ${className}`}
      id={id}
      disabled={disabled}
    />
  );
}
