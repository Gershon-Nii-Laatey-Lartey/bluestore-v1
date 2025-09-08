import React, { useState, useRef, useEffect } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  className
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update active index when value changes
  useEffect(() => {
    const nextIndex = Math.min(value.length, length - 1);
    setActiveIndex(nextIndex);
  }, [value.length, length]);

  // Focus the active input
  useEffect(() => {
    if (inputRefs.current[activeIndex]) {
      inputRefs.current[activeIndex]?.focus();
    }
  }, [activeIndex]);

  const handleInputChange = (index: number, inputValue: string) => {
    // Only allow single digit
    const digit = inputValue.replace(/\D/g, '').slice(0, 1);
    
    if (digit) {
      const newValue = value.split('');
      newValue[index] = digit;
      const updatedValue = newValue.join('');
      
      onChange(updatedValue);
      
      // Move to next input if not the last one
      if (index < length - 1) {
        setActiveIndex(index + 1);
      } else {
        // Check if all digits are filled
        if (updatedValue.length === length) {
          onComplete?.(updatedValue);
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      const newValue = value.split('');
      
      if (newValue[index]) {
        // Clear current digit
        newValue[index] = '';
        onChange(newValue.join(''));
      } else if (index > 0) {
        // Move to previous input and clear it
        setActiveIndex(index - 1);
        newValue[index - 1] = '';
        onChange(newValue.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      setActiveIndex(index + 1);
    } else if (e.key === 'Delete') {
      e.preventDefault();
      const newValue = value.split('');
      newValue[index] = '';
      onChange(newValue.join(''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    
    if (pastedData.length > 0) {
      onChange(pastedData);
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedData.length, length - 1);
      setActiveIndex(nextIndex);
      
      // If all digits are filled, trigger onComplete
      if (pastedData.length === length) {
        onComplete?.(pastedData);
      }
    }
  };

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {Array.from({ length }, (_, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleInputChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => setActiveIndex(index)}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center text-lg font-semibold border-2 transition-colors",
            "focus:border-primary focus:ring-primary",
            activeIndex === index && "border-primary ring-1 ring-primary",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      ))}
    </div>
  );
};
