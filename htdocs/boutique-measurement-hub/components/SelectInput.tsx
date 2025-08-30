
import React from 'react';

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  containerClassName?: string;
  isReadOnly?: boolean;
  children: React.ReactNode;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, id, containerClassName = '', isReadOnly = false, children, ...props }) => {
  const baseClasses = "block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md";
  const readOnlyClasses = "bg-neutral-100 text-neutral-600 cursor-not-allowed appearance-none";
  
  return (
    <div className={containerClassName}>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1">
        {label}
      </label>
      <select
        id={id}
        disabled={isReadOnly}
        className={`${baseClasses} ${isReadOnly ? readOnlyClasses : ''}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export default SelectInput;