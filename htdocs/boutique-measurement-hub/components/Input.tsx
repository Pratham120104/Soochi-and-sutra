
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  containerClassName = '',
  id,
  ...props
}) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-brand-primary mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full px-3 py-2 
          bg-white 
          border-2 border-brand-secondary 
          rounded-lg 
          text-brand-primary placeholder-neutral-400
          focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary
          disabled:bg-neutral-50 disabled:text-neutral-500 disabled:border-neutral-200
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;