export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const validatePhoneNumber = (phone: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!phone.trim()) {
    errors.push({ field: 'phone', message: 'Phone number is required' });
  } else if (!/^\d{10}$/.test(phone.trim())) {
    errors.push({ field: 'phone', message: 'Please enter a valid 10-digit phone number' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateName = (name: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!name.trim()) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  } else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
    errors.push({ field: 'name', message: 'Name can only contain letters and spaces' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateMeasurement = (value: string, fieldName: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (value.trim() === '') {
    return { isValid: true, errors: [] }; // Optional field
  }
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    errors.push({ field: fieldName, message: 'Please enter a valid number' });
  } else if (numValue < 0) {
    errors.push({ field: fieldName, message: 'Measurement cannot be negative' });
  } else if (numValue > 100) {
    errors.push({ field: fieldName, message: 'Measurement seems too large' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!value.trim()) {
    errors.push({ field: fieldName, message: `${fieldName} is required` });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateImageUrl = (url: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (url.trim() === '') {
    return { isValid: true, errors: [] }; // Optional field
  }
  
  try {
    new URL(url);
  } catch {
    errors.push({ field: 'imageUrl', message: 'Please enter a valid URL' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const combineValidationResults = (results: ValidationResult[]): ValidationResult => {
  const allErrors = results.flatMap(result => result.errors);
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}; 