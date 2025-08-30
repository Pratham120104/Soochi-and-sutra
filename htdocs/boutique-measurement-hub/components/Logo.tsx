import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'dark';
  className?: string;
  showText?: boolean;
  iconOnly?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'default', 
  className = '',
  showText = true,
  iconOnly = false
}) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16'
  };

  const logoSizes = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-12'
  };

  if (iconOnly) {
    return (
      <div className={`${sizeClasses[size]} aspect-square ${className}`}>
        <img 
          src="/images/brand.png" 
          alt="Soochi & Sutra Logo Icon" 
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Brand Icon */}
      <div className={`${sizeClasses[size]} aspect-square flex-shrink-0`}>
        <img 
          src="/images/brand.png" 
          alt="Soochi & Sutra Logo Icon" 
          className="w-full h-full object-contain"
        />
      </div>
      {/* Brand Name */}
      {showText && (
        <div className={`${logoSizes[size]} flex-shrink-0`}>
          <img 
            src="/images/brandname.png" 
            alt="Soochi & Sutra" 
            className="h-full w-auto object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default Logo; 